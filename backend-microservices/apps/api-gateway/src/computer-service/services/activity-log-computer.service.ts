import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { COMPUTER_SERVICE_CLIENT } from '../constant';
import { 
  GetComputerActivityDto, 
  GetFileTransferActivityDto,
  GetUserComputerActivitiesDto
} from '../dto';
import { ACTIVITY_PATTERNS } from '@app/contracts/computer-service';

@Injectable()
export class ActivityLogComputerService {
  private readonly logger = new Logger(ActivityLogComputerService.name);

  constructor(
    @Inject(COMPUTER_SERVICE_CLIENT) private computerClient: ClientProxy
  ) {}

  async getComputerActivityHistory(params: GetComputerActivityDto) {
    this.logger.log(`Getting activity history for computer ${params.computerId}`);
    return firstValueFrom(
      this.computerClient.send(ACTIVITY_PATTERNS.GET_COMPUTER_ACTIVITY, params)
    );
  }

  async getFileTransferActivityHistory(params: GetFileTransferActivityDto) {
    this.logger.log(`Getting activity history for file transfer ${params.fileTransferId}`);
    return firstValueFrom(
      this.computerClient.send(ACTIVITY_PATTERNS.GET_FILE_TRANSFER_ACTIVITY, params)
    );
  }

  async getUserComputerActivities(params: GetUserComputerActivitiesDto) {
    this.logger.log(`Getting computer activities for user ${params.targetUserId}`);
    return firstValueFrom(
      this.computerClient.send(ACTIVITY_PATTERNS.GET_USER_COMPUTER_ACTIVITIES, params)
    );
  }
}