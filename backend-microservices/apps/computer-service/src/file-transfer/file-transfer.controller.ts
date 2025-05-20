import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FileTransferService } from './file-transfer.service';
import { FILE_TRANSFER_PATTERNS } from '@app/contracts/computer-service/file-transfer/constants';

@Controller()
export class FileTransferController {
  private readonly logger = new Logger(FileTransferController.name);
  
  constructor(private readonly fileTransferService: FileTransferService) {}

  @MessagePattern(FILE_TRANSFER_PATTERNS.CREATE)
  async create(@Payload() data: any) {
    try {
      const { _metadata, ...createDto } = data;
      
      this.logger.log(`Creating file transfer from user ${_metadata?.user?.sub}`);
      this.fileTransferService.setContext(_metadata);
      
      return this.fileTransferService.create(createDto, _metadata?.user);
    } catch (error) {
      this.logger.error(`Error creating file transfer: ${error.message}`);
      return {
        success: false,
        message: 'Failed to create file transfer',
        error: error.message
      };
    }
  }

  @MessagePattern(FILE_TRANSFER_PATTERNS.FIND_ALL)
  async findAll(@Payload() data: any) {
    try {
      const { _metadata, ...options } = data;
      
      this.logger.log(`Finding all file transfers, page ${options.page}, limit ${options.limit}`);
      this.fileTransferService.setContext(_metadata);
      
      return this.fileTransferService.findAll({
        ...options,
        user: _metadata?.user
      });
    } catch (error) {
      this.logger.error(`Error finding file transfers: ${error.message}`);
      return {
        success: false,
        message: 'Failed to retrieve file transfers',
        error: error.message
      };
    }
  }

  @MessagePattern(FILE_TRANSFER_PATTERNS.FIND_ONE)
  async findOne(@Payload() data: any) {
    try {
      const { id, _metadata } = data;
      
      this.logger.log(`Finding file transfer with id: ${id}`);
      this.fileTransferService.setContext(_metadata);
      
      return this.fileTransferService.findOne(id);
    } catch (error) {
      this.logger.error(`Error finding file transfer: ${error.message}`);
      return {
        success: false,
        message: 'Failed to retrieve file transfer',
        error: error.message
      };
    }
  }

  @MessagePattern(FILE_TRANSFER_PATTERNS.UPDATE_STATUS)
  async updateStatus(@Payload() data: any) {
    try {
      const { _metadata, ...updateData } = data;
      
      this.logger.log(`Updating status of file transfer ${updateData.id}`);
      this.fileTransferService.setContext(_metadata);
      
      return this.fileTransferService.updateStatus(updateData, _metadata?.user);
    } catch (error) {
      this.logger.error(`Error updating file transfer status: ${error.message}`);
      return {
        success: false,
        message: 'Failed to update file transfer status',
        error: error.message
      };
    }
  }

  @MessagePattern(FILE_TRANSFER_PATTERNS.DOWNLOAD)
  async downloadFile(@Payload() data: any) {
    try {
      const { id, computerId, _metadata } = data;
      
      this.logger.log(`Download request for file transfer ${id} from computer ${computerId}`);
      this.fileTransferService.setContext(_metadata);
      
      return this.fileTransferService.downloadFile(id, computerId, _metadata?.user);
    } catch (error) {
      this.logger.error(`Error downloading file: ${error.message}`);
      return {
        success: false,
        message: 'Failed to download file',
        error: error.message,
        statusCode: 500
      };
    }
  }

  @MessagePattern(FILE_TRANSFER_PATTERNS.GET_BY_COMPUTER)
  async getByComputer(@Payload() data: any) {
    try {
      const { computerId, _metadata, ...options } = data;
      
      this.logger.log(`Getting file transfers for computer ${computerId}`);
      this.fileTransferService.setContext(_metadata);
      
      return this.fileTransferService.findAll({
        ...options,
        targetId: computerId,
        user: _metadata?.user
      });
    } catch (error) {
      this.logger.error(`Error getting file transfers for computer: ${error.message}`);
      return {
        success: false,
        message: 'Failed to get file transfers for computer',
        error: error.message
      };
    }
  }

  @MessagePattern(FILE_TRANSFER_PATTERNS.GET_BY_USER)
  async getByUser(@Payload() data: any) {
    try {
      const { userId, _metadata, ...options } = data;
      
      this.logger.log(`Getting file transfers for user ${userId}`);
      this.fileTransferService.setContext(_metadata);
      
      // Assuming teacher has userId matching teacherId in the transfer
      return this.fileTransferService.findAll({
        ...options,
        teacherId: userId,
        user: _metadata?.user
      });
    } catch (error) {
      this.logger.error(`Error getting file transfers for user: ${error.message}`);
      return {
        success: false,
        message: 'Failed to get file transfers for user',
        error: error.message
      };
    }
  }
}