import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { COMPUTER_SERVICE_CLIENT } from '../constant';
import { 
  GetComputerUsageDto, 
  CreateComputerUsageDto,
  DeleteComputerUsageDto
} from '../dto';
import { COMPUTER_USAGE_PATTERNS } from '@app/contracts/computer-service/computer-usage/constants';

@Injectable()
export class ComputerUsageService {
  private readonly logger = new Logger(ComputerUsageService.name);

  constructor(
    @Inject(COMPUTER_SERVICE_CLIENT) private computerClient: ClientProxy
  ) {}

  async findAll(filters: any, user: any) {
    this.logger.log(`Finding all computer usages with filters: ${JSON.stringify(filters)}`);
    return firstValueFrom(
      this.computerClient.send(COMPUTER_USAGE_PATTERNS.FIND_ALL, {
        ...filters,
        _metadata: { user }
      })
    );
  }

  async findOne(id: number, user: any) {
    this.logger.log(`Finding computer usage with id: ${id}`);
    return firstValueFrom(
      this.computerClient.send(COMPUTER_USAGE_PATTERNS.FIND_ONE, {
        id,
        _metadata: { user }
      })
    );
  }

  async create(createDto: CreateComputerUsageDto, user: any) {
    this.logger.log(`Creating computer usage: ${JSON.stringify(createDto)}`);
    return firstValueFrom(
      this.computerClient.send(COMPUTER_USAGE_PATTERNS.CREATE, {
        ...createDto,
        _metadata: { user }
      })
    );
  }

  async delete(id: number, deleteDto: DeleteComputerUsageDto, user: any) {
    this.logger.log(`Deleting computer usage ${id}: ${JSON.stringify(deleteDto)}`);
    return firstValueFrom(
      this.computerClient.send(COMPUTER_USAGE_PATTERNS.DELETE, {
        id,
        ...deleteDto,
        _metadata: { user }
      })
    );
  }

  async getComputerUsageHistory(id: number, options: { 
    page?: number, 
    limit?: number, 
    startDate?: string, 
    endDate?: string 
  }, user: any) {
    this.logger.log(`Getting usage history for computer with ID: ${id}`);
    
    return firstValueFrom(
      this.computerClient.send(COMPUTER_USAGE_PATTERNS.GET_HISTORY, {
        id: +id,
        page: +(options.page || 1),
        limit: +(options.limit || 10),
        startDate: options.startDate,
        endDate: options.endDate,
        _metadata: { user }
      })
    );
  }

  async getUserStats(userId: number, params: { startDate?: string; endDate?: string }, user: any) {
    this.logger.log(`Getting computer usage stats for user ${userId}`);
    return firstValueFrom(
      this.computerClient.send(COMPUTER_USAGE_PATTERNS.GET_STATS, {
        userId,
        ...params,
        _metadata: { user }
      })
    );
  }
}