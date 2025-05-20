import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ROOM_SERVICE_CLIENT } from '../constant';
import { CreateRoomUsageDto } from '../dto/room-usage/create-room-usage.dto';
import { ROOM_USAGE_PATTERNS } from '@app/contracts/room-service/room-usage/constants';

@Injectable()
export class RoomUsageService {
  private readonly logger = new Logger(RoomUsageService.name);

  constructor(
    @Inject(ROOM_SERVICE_CLIENT) private roomClient: ClientProxy
  ) {}

  async findAll(params: {
    page: number;
    limit: number;
    filters?: any;
  }, user: any) {
    this.logger.log(`Finding all room usages with params: ${JSON.stringify(params)}`);
    return firstValueFrom(
      this.roomClient.send(ROOM_USAGE_PATTERNS.FIND_ALL, {
        ...params,
        userId: user.sub,
        userRole: user.role
      })
    );
  }

  async findOne(id: number, user: any) {
    this.logger.log(`Finding room usage with id: ${id}`);
    return firstValueFrom(
      this.roomClient.send(ROOM_USAGE_PATTERNS.FIND_ONE, {
        id,
        userId: user.sub,
        userRole: user.role
      })
    );
  }

  async startUsage(createRoomUsageDto: CreateRoomUsageDto, user: any) {
    this.logger.log(`Starting room usage: ${JSON.stringify(createRoomUsageDto)}`);
    return firstValueFrom(
      this.roomClient.send(ROOM_USAGE_PATTERNS.START, {
        ...createRoomUsageDto,
        userId: user.sub,
        userRole: user.role
      })
    );
  }

  async endUsage(id: number, user: any) {
    this.logger.log(`Ending room usage ${id}`);
    return firstValueFrom(
      this.roomClient.send(ROOM_USAGE_PATTERNS.END, {
        id,
        userId: user.sub,
        userRole: user.role,
        endTime: new Date()
      })
    );
  }

  async getRoomUsageHistory(roomId: number, params: {
    page: number;
    limit: number;
    startDate?: string;
    endDate?: string;
  }, user: any) {
    this.logger.log(`Getting usage history for room ${roomId}`);
    return firstValueFrom(
      this.roomClient.send(ROOM_USAGE_PATTERNS.GET_ROOM_HISTORY, {
        roomId,
        ...params,
        userId: user.sub,
        userRole: user.role
      })
    );
  }

  async getUserRoomActivities(targetUserId: number, params: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }, currentUser: any) {
    this.logger.log(`Getting room activities for user ${targetUserId}`);
    return firstValueFrom(
      this.roomClient.send(ROOM_USAGE_PATTERNS.GET_USER_ACTIVITIES, {
        targetUserId,
        currentUserId: currentUser.sub,
        role: currentUser.role,
        ...params
      })
    );
  }

  async markRoomForMaintenance(roomId: number, maintenanceData: any, user: any) {
    this.logger.log(`Marking room ${roomId} for maintenance`);
    return firstValueFrom(
      this.roomClient.send(ROOM_USAGE_PATTERNS.MARK_MAINTENANCE, {
        roomId,
        maintenanceData,
        currentUser: {
          sub: user.sub,
          role: user.role
        }
      })
    );
  }
}