import { Inject, Injectable, Logger, StreamableFile } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { COMPUTER_SERVICE_CLIENT } from '../constant';
import { FILE_TRANSFER_PATTERNS } from '@app/contracts/computer-service/file-transfer/constants';
import { CreateFileTransferDto } from '../dto/file-transfer/create-file-transfer.dto';
import { UpdateTransferStatusDto } from '../dto/file-transfer/update-transfer-status.dto';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { FileTransferGateway } from '../socket/file-transfer.gateway';

@Injectable()
export class FileTransferService {
  private readonly logger = new Logger(FileTransferService.name);
  private readonly uploadDir = path.join(process.cwd(), 'uploads');
  private readonly downloadDir = path.join(process.cwd(), 'downloads');

  constructor(
    @Inject(COMPUTER_SERVICE_CLIENT) private computerClient: ClientProxy,
    private readonly fileTransferGateway: FileTransferGateway
  ) {
  }

  async create(createDto: CreateFileTransferDto, file: Express.Multer.File, user: any) {
    this.logger.log(`Creating file transfer from user ${user.sub}`);
    
    // Prepare file data for transmission
    const fileData = {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      buffer: file.buffer.toString('base64'), // Convert buffer to base64 for transmission
    };
    
    const result = await firstValueFrom(
      this.computerClient.send(FILE_TRANSFER_PATTERNS.CREATE, {
        ...createDto,
        file: fileData,
        _metadata: { user }
      })
    );
    
    // If successful, notify clients via WebSocket
    if (result.success && result.data) {
      this.fileTransferGateway.notifyNewFileTransfer(
        createDto.targetComputerIds, 
        {
          id: result.data.id,
          fileName: file.originalname,
          fileSize: file.size,
          fileType: file.mimetype,
          sourceId: createDto.sourceId,
          teacherId: user.sub,
          createdAt: new Date()
        }
      );
    }
    
    return result;
  }

  async findAll(filters: any, user: any) {
    this.logger.log(`Finding all file transfers with filters: ${JSON.stringify(filters)}`);
    return firstValueFrom(
      this.computerClient.send(FILE_TRANSFER_PATTERNS.FIND_ALL, {
        ...filters,
        _metadata: { user }
      })
    );
  }

  async findOne(id: number, user: any) {
    this.logger.log(`Finding file transfer with id: ${id}`);
    return firstValueFrom(
      this.computerClient.send(FILE_TRANSFER_PATTERNS.FIND_ONE, {
        id,
        _metadata: { user }
      })
    );
  }

  async updateStatus(id: number, updateDto: UpdateTransferStatusDto, user: any) {
    this.logger.log(`Updating status of file transfer ${id}: ${JSON.stringify(updateDto)}`);
    
    const result = await firstValueFrom(
      this.computerClient.send(FILE_TRANSFER_PATTERNS.UPDATE_STATUS, {
        id,
        ...updateDto,
        _metadata: { user }
      })
    );
    
    // Notify via WebSocket if status updated for a specific computer
    if (result.success && updateDto.targetComputerId) {
      this.fileTransferGateway.updateFileTransferStatus(
        updateDto.targetComputerId, 
        {
          id,
          status: updateDto.status,
          updatedAt: new Date()
        }
      );
    }
    
    return result;
  }
  
  async getByComputer(computerId: number, options: any, user: any) {
    this.logger.log(`Getting file transfers for computer ${computerId}`);
    return firstValueFrom(
      this.computerClient.send(FILE_TRANSFER_PATTERNS.GET_BY_COMPUTER, {
        computerId,
        ...options,
        _metadata: { user }
      })
    );
  }
  
  async getByUser(userId: number, options: any, user: any) {
    this.logger.log(`Getting file transfers for user ${userId}`);
    return firstValueFrom(
      this.computerClient.send(FILE_TRANSFER_PATTERNS.GET_BY_USER, {
        userId,
        ...options,
        _metadata: { user }
      })
    );
  }

  async downloadFile(id: number, computerId: number, user: any) {
    this.logger.log(`Requesting download for file transfer ${id} to computer ${computerId}`);
    
    const result = await firstValueFrom(
      this.computerClient.send(FILE_TRANSFER_PATTERNS.DOWNLOAD, {
        id,
        computerId,
        _metadata: { user }
      })
    );
    
    if (!result.success) {
      return result;
    }
    
    // Write the file to local storage temporarily for streaming
    const localPath = path.join(this.downloadDir, `${id}-${result.data.fileName}`);
    fs.writeFileSync(localPath, Buffer.from(result.data.fileContent, 'base64'));
    
    return {
      success: true,
      message: 'File ready for download',
      data: {
        filePath: localPath,
        fileName: result.data.fileName,
        fileType: result.data.fileType
      }
    };
  }
}