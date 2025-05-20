import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { COMPUTER_SERVICE_CLIENT } from '../constant';
import { COMPUTER_ACTIVITY_PATTERNS } from '@app/contracts/computer-service/activity/constants';

@Injectable()
export class ActivityLogComputerService {
  private readonly logger = new Logger(ActivityLogComputerService.name);

  constructor(
    @Inject(COMPUTER_SERVICE_CLIENT) private computerClient: ClientProxy
  ) {}

  async getComputerActivityHistory(id: number, options: { 
    page?: number, 
    limit?: number, 
    startDate?: string, 
    endDate?: string 
  }, user: any) {
    this.logger.log(`Getting activity history for computer with ID: ${id}`);
    
    return firstValueFrom(
      this.computerClient.send(COMPUTER_ACTIVITY_PATTERNS.GET_COMPUTER_ACTIVITY, {
        id: +id,
        page: +(options.page || 1),
        limit: +(options.limit || 10),
        startDate: options.startDate,
        endDate: options.endDate,
        _metadata: { user }
      })
    );
  }

  async getFileTransferActivityHistory(fileTransferId: number, options: {
    page?: number,
    limit?: number
  }, user: any) {
    this.logger.log(`Getting activity history for file transfer ${fileTransferId}`);
    return firstValueFrom(
      this.computerClient.send(COMPUTER_ACTIVITY_PATTERNS.GET_FILE_TRANSFER_ACTIVITY, {
        fileTransferId,
        page: +(options.page || 1),
        limit: +(options.limit || 10),
        _metadata: { user }
      })
    );
  }

  async getUserComputerActivities(targetUserId: number, options: {
    page?: number,
    limit?: number,
    startDate?: string,
    endDate?: string,
    computerIds?: number[]
  }, user: any) {
    this.logger.log(`Getting computer activities for user ${targetUserId}`);
    return firstValueFrom(
      this.computerClient.send(COMPUTER_ACTIVITY_PATTERNS.GET_USER_COMPUTER_ACTIVITIES, {
        userId: targetUserId,
        currentUserId: user.sub,
        role: user.role,
        page: +(options.page || 1),
        limit: +(options.limit || 10),
        startDate: options.startDate,
        endDate: options.endDate,
        computerIds: options.computerIds,
        _metadata: { user }
      })
    );
  }

  async getComputerUsageStats(userId: number, options: {
    startDate?: string,
    endDate?: string
  }, user: any) {
    this.logger.log(`Getting computer usage statistics for user ${userId}`);
    return firstValueFrom(
      this.computerClient.send(COMPUTER_ACTIVITY_PATTERNS.GET_COMPUTER_USAGE_STATS, {
        userId,
        startDate: options.startDate,
        endDate: options.endDate,
        _metadata: { user }
      })
    );
  }
}