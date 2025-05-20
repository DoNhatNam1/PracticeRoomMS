import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@app/prisma/prisma.service';
import { ActivityLogComputerService } from '../activity-log-computer/activity-log-computer.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileTransferService {
  private readonly logger = new Logger(FileTransferService.name);
  private readonly uploadDir = path.join(process.cwd(), 'uploads');
  private context: any = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogService: ActivityLogComputerService
  ) {
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  setContext(context: any) {
    this.context = context;
  }

  async create(data: any, user: any) {
    try {
      const { file, targetComputerIds, sourceId } = data;
      
      // Save file to disk from base64
      const uniqueFilename = `${Date.now()}-${file.originalname}`;
      const filePath = path.join(this.uploadDir, uniqueFilename);
      
      // Create directory if it doesn't exist
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Decode and write the file
      const fileBuffer = Buffer.from(file.buffer, 'base64');
      fs.writeFileSync(filePath, fileBuffer);
      
      // Create file transfer records in database using transaction
      const result = await this.prisma.$transaction(async (tx) => {
        // Create main file transfer record - match schema field names
        const transfer = await tx.fileTransfer.create({
          data: {
            filename: uniqueFilename,
            originalName: file.originalname,
            size: file.size,
            mimeType: file.mimetype,
            path: uniqueFilename,
            sourceId,
            userId: parseInt(user?.sub),
            status: 'PENDING',
            transferredAt: new Date()
          }
        });
        
        // Create target records for each computer
        const targetPromises = targetComputerIds.map(computerId => 
          tx.fileTransferTarget.create({
            data: {
              fileTransferId: transfer.id,
              computerId,
              status: 'PENDING'
            }
          })
        );
        
        const targets = await Promise.all(targetPromises);
        
        return {
          transfer,
          targets
        };
      });
      
      // Log activity
      await this.activityLogService.logActivity(
        user?.sub, // Actor ID (teacher)
        'FILE_TRANSFER_CREATED',
        'FILE_TRANSFER',
        result.transfer.id,
        {
          filename: result.transfer.filename,
          originalName: result.transfer.originalName,
          size: result.transfer.size,
          targetComputerIds,
          sourceId
        },
        null // visibleToId (optional)
      );
      
      return {
        success: true,
        message: 'File transfer created successfully',
        data: result.transfer
      };
    } catch (error) {
      this.logger.error(`Error creating file transfer: ${error.message}`);
      return {
        success: false,
        message: 'Failed to create file transfer',
        error: error.message
      };
    }
  }

  async updateStatus(data: any, user: any) {
    try {
      const { id, status, targetComputerId, notes } = data;
      
      // Find the transfer
      const transfer = await this.prisma.fileTransfer.findUnique({
        where: { id },
        include: {
          targets: true
        }
      });
      
      if (!transfer) {
        return {
          success: false,
          message: 'File transfer not found',
          statusCode: 404
        };
      }
      
      // Update with transaction
      if (targetComputerId) {
        // Update specific target
        await this.prisma.fileTransferTarget.updateMany({
          where: {
            fileTransferId: id,
            computerId: targetComputerId
          },
          data: {
            status,
            // No updatedAt in schema
          }
        });
        
        // Log target-specific activity
        await this.activityLogService.logActivity(
          user?.sub,
          'FILE_TRANSFER_STATUS_UPDATED',
          'FILE_TRANSFER',
          id,
          {
            status,
            targetComputerId,
            notes
          },
          null
        );
        
        // Check if all targets completed/failed
        const allTargets = await this.prisma.fileTransferTarget.findMany({
          where: { fileTransferId: id }
        });
        
        const allCompleted = allTargets.every(t => 
          t.status === 'COMPLETED' || t.status === 'FAILED'
        );
        
        if (allCompleted) {
          // Update main transfer status
          await this.prisma.fileTransfer.update({
            where: { id },
            data: {
              status: 'COMPLETED',
              // Schema has updatedAt
              updatedAt: new Date()
            }
          });
          
          // Log completion activity
          await this.activityLogService.logActivity(
            user?.sub,
            'FILE_TRANSFER_COMPLETED',
            'FILE_TRANSFER',
            id,
            {
              status: 'COMPLETED',
              completedAt: new Date()
            },
            null
          );
        }
      } else {
        // Update main transfer - schema doesn't have notes field
        await this.prisma.fileTransfer.update({
          where: { id },
          data: {
            status,
            updatedAt: new Date()
          }
        });
        
        // Update all targets if main status changes
        if (['FAILED'].includes(status)) {
          await this.prisma.fileTransferTarget.updateMany({
            where: {
              fileTransferId: id,
              status: 'PENDING'
            },
            data: {
              status
            }
          });
        }
        
        // Log main transfer activity
        await this.activityLogService.logActivity(
          user?.sub,
          'FILE_TRANSFER_STATUS_UPDATED',
          'FILE_TRANSFER',
          id,
          {
            status,
            notes,
            updatedAt: new Date()
          },
          null
        );
      }
      
      return {
        success: true,
        message: 'File transfer status updated successfully'
      };
    } catch (error) {
      this.logger.error(`Error updating file transfer status: ${error.message}`);
      return {
        success: false,
        message: 'Failed to update file transfer status',
        error: error.message
      };
    }
  }

  async downloadFile(id: number, computerId: number, user: any) {
    try {
      // Find the file transfer
      const transfer = await this.prisma.fileTransfer.findUnique({
        where: { id }
      });
      
      if (!transfer) {
        return {
          success: false,
          message: 'File transfer not found',
          statusCode: 404
        };
      }
      
      // Verify this computer is a target of the transfer
      const target = await this.prisma.fileTransferTarget.findFirst({
        where: {
          fileTransferId: id,
          computerId
        }
      });
      
      if (!target) {
        return {
          success: false,
          message: 'This computer is not a target for this file transfer',
          statusCode: 403
        };
      }
      
      // Read the file using correct schema field names
      const filePath = path.join(this.uploadDir, transfer.path);
      if (!fs.existsSync(filePath)) {
        return {
          success: false,
          message: 'File not found on server',
          statusCode: 404
        };
      }
      
      // Read file and convert to base64
      const fileContent = fs.readFileSync(filePath).toString('base64');
      
      // Update target status to COMPLETED if it was PENDING
      if (target.status === 'PENDING') {
        await this.prisma.fileTransferTarget.update({
          where: { id: target.id },
          data: {
            status: 'COMPLETED'
          }
        });
        
        // Log activity
        await this.activityLogService.logActivity(
          user?.sub,
          'FILE_DOWNLOAD',
          'FILE_TRANSFER',
          id,
          {
            computerId,
            fileName: transfer.originalName,
            downloadedAt: new Date()
          },
          null
        );
      }
      
      return {
        success: true,
        message: 'File retrieved successfully',
        data: {
          fileName: transfer.originalName,
          fileType: transfer.mimeType,
          fileContent
        }
      };
    } catch (error) {
      this.logger.error(`Error downloading file: ${error.message}`);
      return {
        success: false,
        message: 'Failed to download file',
        error: error.message
      };
    }
  }

  async findAll(options: any) {
    try {
      const { page = 1, limit = 10, status, sourceId, targetId, user } = options;
      
      // Base query
      const where: any = {};
      
      // Add filters
      if (status) {
        where.status = status;
      }
      
      if (sourceId) {
        where.sourceId = sourceId;
      }
      
      // Special query for target computer
      if (targetId) {
        where.targets = {
          some: {
            computerId: targetId
          }
        };
      }
      
      // Pagination
      const skip = (page - 1) * limit;
      
      // Execute query
      const [transfers, total] = await Promise.all([
        this.prisma.fileTransfer.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            targets: {
              include: {
                computer: true
              }
            }
          }
        }),
        this.prisma.fileTransfer.count({ where })
      ]);
      
      return {
        success: true,
        message: 'File transfers retrieved successfully',
        data: {
          transfers,
          meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      };
    } catch (error) {
      this.logger.error(`Error finding file transfers: ${error.message}`);
      return {
        success: false,
        message: 'Failed to retrieve file transfers',
        error: error.message
      };
    }
  }

  async findOne(id: number) {
    try {
      const transfer = await this.prisma.fileTransfer.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          targets: {
            include: {
              computer: true
            }
          }
        }
      });
      
      if (!transfer) {
        return {
          success: false,
          message: 'File transfer not found',
          statusCode: 404
        };
      }
      
      return {
        success: true,
        message: 'File transfer retrieved successfully',
        data: transfer
      };
    } catch (error) {
      this.logger.error(`Error finding file transfer: ${error.message}`);
      return {
        success: false,
        message: 'Failed to retrieve file transfer',
        error: error.message
      };
    }
  }
}