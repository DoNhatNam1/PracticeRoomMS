import { Injectable, Logger } from '@nestjs/common';
import { ActivityLogComputerService } from '../activity-log-computer/activity-log-computer.service';
import { PrismaService } from '@app/prisma/prisma.service';
import { CreateComputerUsageDto } from '@app/contracts/computer-service/computer-usage/dto/create-computer-usage.dto';
import { DeleteComputerUsageDto } from '@app/contracts/computer-service/computer-usage/dto/delete-computer-usage.dto';

@Injectable()
export class ComputerUsageService {
  private readonly logger = new Logger(ComputerUsageService.name);
  private context: any = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogService: ActivityLogComputerService
  ) {}

  setContext(context: any) {
    this.context = context;
  }

  async create(createDto: CreateComputerUsageDto, user: any) {
    try {
      // Validate computer exists and is available
      const computer = await this.prisma.computer.findUnique({
        where: { id: createDto.computerId }
      });
  
      if (!computer) {
        return {
          success: false,
          message: 'Computer not found',
          statusCode: 404
        };
      }
  
      if (computer.status !== 'OPERATIONAL') {
        return {
          success: false,
          message: `Computer is currently ${computer.status.toLowerCase()}, not available for use`,
          statusCode: 400
        };
      }
  
      // Create computer usage record with transaction
      const usage = await this.prisma.$transaction(async (tx) => {
        // First create or find a room usage record for this user and room
        let roomUsage = await tx.roomUsage.findFirst({
          where: {
            roomId: computer.roomId,
            userId: parseInt(user?.sub),
            endTime: null, // Active room usage
          }
        });
  
        // If no active room usage exists, create one
        if (!roomUsage) {
          roomUsage = await tx.roomUsage.create({
            data: {
              roomId: computer.roomId,
              userId: parseInt(user?.sub),
              startTime: new Date(),
              purpose: 'Computer usage'
            }
          });
  
          // Also update room status
          await tx.room.update({
            where: { id: computer.roomId },
            data: { status: 'IN_USE' }
          });
        }
  
        // Update computer status
        await tx.computer.update({
          where: { id: createDto.computerId },
          data: { status: 'IN_USE' }
        });
  
        // Create usage record with roomUsageId
        return tx.computerUsage.create({
          data: {
            computerId: createDto.computerId,
            roomUsageId: roomUsage.id, // Connect to the room usage
            startTime: new Date(),
            notes: createDto.notes || null
          }
        });
      });
  
      // Log activity
      await this.activityLogService.logActivity(
        user?.sub,
        'CREATE_COMPUTER_USAGE',
        'COMPUTER_USAGE',
        usage.id,
        {
          computerId: createDto.computerId,
          notes: createDto.notes
        }
      );
  
      return {
        success: true,
        message: 'Computer usage created successfully',
        data: usage
      };
    } catch (error) {
      this.logger.error(`Error creating computer usage: ${error.message}`);
      return {
        success: false,
        message: 'Failed to create computer usage',
        error: error.message
      };
    }
  }
  async findAll(options: { 
    page: number; 
    limit: number; 
    status?: string;
    startDate?: string;
    endDate?: string;
    user?: any;
  }) {
    try {
      const { page, limit, status, startDate, endDate } = options;
      
      // Build query conditions
      const where: any = {};
      
      if (status) {
        where.endTime = status === 'ACTIVE' ? null : { not: null };
      }
      
      // Add date filters
      if (startDate || endDate) {
        where.startTime = {};
        if (startDate) where.startTime.gte = new Date(startDate);
        if (endDate) where.startTime.lte = new Date(endDate);
      }
      
      // Pagination
      const skip = (page - 1) * limit;
      
      // Query database
      const [usages, total] = await Promise.all([
        this.prisma.computerUsage.findMany({
          where,
          skip,
          take: limit,
          orderBy: { startTime: 'desc' },
          include: {
            computer: true,
            roomUsage: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }),
        this.prisma.computerUsage.count({ where })
      ]);
  
      // Transform data for response
      const mappedUsages = usages.map(usage => ({
        ...usage,
        user: usage.roomUsage?.user || null,
        roomUsage: {
          ...usage.roomUsage,
          // Omit the user from roomUsage to avoid duplication
          user: undefined
        }
      }));
      
      return {
        success: true,
        message: 'Computer usages retrieved successfully',
        data: {
          usages: mappedUsages,
          meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      };
    } catch (error) {
      this.logger.error(`Error finding computer usages: ${error.message}`);
      return {
        success: false,
        message: 'Failed to retrieve computer usages',
        error: error.message
      };
    }
  }

  async findOne(id: number, user: any) {
    try {
      const usage = await this.prisma.computerUsage.findUnique({
        where: { id },
        include: {
          computer: true,
          roomUsage: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      });
      
      if (!usage) {
        return {
          success: false,
          message: 'Computer usage not found',
          statusCode: 404
        };
      }
      
      // Transform data to include user at top level
      const transformedUsage = {
        ...usage,
        user: usage.roomUsage?.user || null,
        roomUsage: {
          ...usage.roomUsage,
          // Avoid duplicating user data
          user: undefined
        }
      };
      
      return {
        success: true,
        message: 'Computer usage retrieved successfully',
        data: transformedUsage
      };
    } catch (error) {
      this.logger.error(`Error finding computer usage: ${error.message}`);
      return {
        success: false,
        message: 'Failed to retrieve computer usage',
        error: error.message
      };
    }
  }

  async delete(id: number, deleteDto: DeleteComputerUsageDto, user: any) {
    try {
      // Find the usage record
      const usage = await this.prisma.computerUsage.findUnique({
        where: { id },
        include: { computer: true }
      });
      
      if (!usage) {
        return {
          success: false,
          message: 'Computer usage not found',
          statusCode: 404
        };
      }
      
      // Delete the usage in a transaction
      await this.prisma.$transaction(async (tx) => {
        // Delete the usage record
        await tx.computerUsage.delete({
          where: { id }
        });
        
        // Update computer status back to operational
        await tx.computer.update({
          where: { id: usage.computerId },
          data: { status: 'OPERATIONAL' }
        });
      });
      
      // Log activity
      await this.activityLogService.logActivity(
        user?.sub,
        'DELETE_COMPUTER_USAGE',
        'COMPUTER_USAGE',
        id,
        {
          computerId: usage.computerId,
          notes: deleteDto.notes || 'Usage deleted'
        }
      );
      
      return {
        success: true,
        message: 'Computer usage deleted successfully'
      };
    } catch (error) {
      this.logger.error(`Error deleting computer usage: ${error.message}`);
      return {
        success: false,
        message: 'Failed to delete computer usage',
        error: error.message
      };
    }
  }
}