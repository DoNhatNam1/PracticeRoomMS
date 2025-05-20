import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ComputerUsageService } from './computer-usage.service';
import { COMPUTER_USAGE_PATTERNS } from '@app/contracts/computer-service/computer-usage/constants';

@Controller()
export class ComputerUsageController {
  private readonly logger = new Logger(ComputerUsageController.name);
  
  constructor(private readonly computerUsageService: ComputerUsageService) {}

  @MessagePattern(COMPUTER_USAGE_PATTERNS.CREATE)
  async createUsage(@Payload() data: any) {
    try {
      const { _metadata, ...createDto } = data;
      
      this.logger.log(`Creating computer usage for computer ${createDto.computerId}`);
      this.computerUsageService.setContext(_metadata);
      
      return this.computerUsageService.create(createDto, _metadata?.user);
    } catch (error) {
      this.logger.error(`Error creating computer usage: ${error.message}`);
      return {
        success: false,
        message: 'Failed to create computer usage',
        error: error.message
      };
    }
  }

  @MessagePattern(COMPUTER_USAGE_PATTERNS.FIND_ALL)
  async findAll(@Payload() data: any) {
    try {
      const { _metadata, page = 1, limit = 10, status, startDate, endDate } = data;
      
      this.logger.log(`Finding all computer usages, page ${page}, limit ${limit}`);
      this.computerUsageService.setContext(_metadata);
      
      return this.computerUsageService.findAll({ 
        page: +page, 
        limit: +limit, 
        status, 
        startDate, 
        endDate,
        user: _metadata?.user
      });
    } catch (error) {
      this.logger.error(`Error finding computer usages: ${error.message}`);
      return {
        success: false,
        message: 'Failed to retrieve computer usages',
        error: error.message
      };
    }
  }

  @MessagePattern(COMPUTER_USAGE_PATTERNS.FIND_ONE)
  async findOne(@Payload() data: any) {
    try {
      const { _metadata, id } = data;
      
      this.logger.log(`Finding computer usage with ID: ${id}`);
      this.computerUsageService.setContext(_metadata);
      
      return this.computerUsageService.findOne(+id, _metadata?.user);
    } catch (error) {
      this.logger.error(`Error finding computer usage: ${error.message}`);
      return {
        success: false,
        message: 'Failed to retrieve computer usage',
        error: error.message
      };
    }
  }

  @MessagePattern(COMPUTER_USAGE_PATTERNS.DELETE)
  async deleteUsage(@Payload() data: any) {
    try {
      const { _metadata, id, ...deleteDto } = data;
      
      this.logger.log(`Deleting computer usage with ID: ${id}`);
      this.computerUsageService.setContext(_metadata);
      
      return this.computerUsageService.delete(+id, deleteDto, _metadata?.user);
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