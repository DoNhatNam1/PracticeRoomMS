import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { COMPUTER_SERVICE_CLIENT } from '../constant';
import { 
  StartComputerUsageDto, 
  EndComputerUsageDto, 
  GetComputerUsageDto 
} from '../dto';
import { COMPUTER_USAGE_PATTERNS } from '@app/contracts/computer-service';

@Injectable()
export class ComputerUsageService {
  private readonly logger = new Logger(ComputerUsageService.name);

  constructor(
    @Inject(COMPUTER_SERVICE_CLIENT) private computerClient: ClientProxy
  ) {}

  async findAll(params: GetComputerUsageDto) {
    this.logger.log(`Finding all computer usages with params: ${JSON.stringify(params)}`);
    return firstValueFrom(
      this.computerClient.send(COMPUTER_USAGE_PATTERNS.FIND_ALL, params)
    );
  }

  async findOne(id: number, user: any) {
    this.logger.log(`Finding computer usage with id: ${id}`);
    return firstValueFrom(
      this.computerClient.send(COMPUTER_USAGE_PATTERNS.FIND_ONE, {
        id,
        userId: user.sub,
        role: user.role
      })
    );
  }

  async startUsage(startUsageDto: StartComputerUsageDto) {
    this.logger.log(`Starting computer usage: ${JSON.stringify(startUsageDto)}`);
    return firstValueFrom(
      this.computerClient.send(COMPUTER_USAGE_PATTERNS.START, startUsageDto)
    );
  }

  async endUsage(id: number, endUsageDto: EndComputerUsageDto) {
    this.logger.log(`Ending computer usage ${id}: ${JSON.stringify(endUsageDto)}`);
    return firstValueFrom(
      this.computerClient.send(COMPUTER_USAGE_PATTERNS.END, {
        id,
        ...endUsageDto
      })
    );
  }

  async getComputerUsageHistory(computerId: number, params: GetComputerUsageDto) {
    this.logger.log(`Getting usage history for computer ${computerId}`);
    return firstValueFrom(
      this.computerClient.send(COMPUTER_USAGE_PATTERNS.GET_COMPUTER_HISTORY, {
        computerId,
        ...params
      })
    );
  }

  async getUserStats(userId: number, params: { startDate?: string; endDate?: string }) {
    this.logger.log(`Getting computer usage stats for user ${userId}`);
    return firstValueFrom(
      this.computerClient.send(COMPUTER_USAGE_PATTERNS.GET_USER_STATS, {
        userId,
        ...params
      })
    );
  }
}