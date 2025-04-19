import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ROOM_SERVICE_CLIENT } from '../constant';
import { CreateRoomDto, UpdateRoomDto } from '../dto/rooms';
import { ROOMS_PATTERNS, UpdateRoomStatusDto } from '@app/contracts/room-service';

@Injectable()
export class RoomsService {
  private readonly logger = new Logger(RoomsService.name);

  constructor(
    @Inject(ROOM_SERVICE_CLIENT) private roomClient: ClientProxy
  ) {}

  async findAll(params: {
    page: number;
    limit: number;
    filters?: any;
  }) {
    this.logger.log(`Finding all rooms with params: ${JSON.stringify(params)}`);
    return firstValueFrom(
      this.roomClient.send(ROOMS_PATTERNS.FIND_ALL, params)
    );
  }

  async findOne(id: number) {
    this.logger.log(`Finding room with id: ${id}`);
    return firstValueFrom(
      this.roomClient.send(ROOMS_PATTERNS.FIND_ONE, { id })
    );
  }

  async create(createRoomDto: CreateRoomDto, user: any) {
    this.logger.log(`Creating new room: ${JSON.stringify(createRoomDto)}`);
    return firstValueFrom(
      this.roomClient.send(ROOMS_PATTERNS.CREATE, {
        ...createRoomDto,
        createdBy: user.sub
      })
    );
  }

  async update(id: number, updateRoomDto: UpdateRoomDto, user: any) {
    this.logger.log(`Updating room ${id}: ${JSON.stringify(updateRoomDto)}`);
    return firstValueFrom(
      this.roomClient.send(ROOMS_PATTERNS.UPDATE, {
        id,
        ...updateRoomDto,
        updatedBy: user.sub
      })
    );
  }

  async remove(id: number, user: any) {
    this.logger.log(`Removing room ${id}`);
    return firstValueFrom(
      this.roomClient.send(ROOMS_PATTERNS.REMOVE, {
        id,
        deletedBy: user.sub
      })
    );
  }

  async updateStatus(id: number, updateStatusDto: UpdateRoomStatusDto, user: any) {
    this.logger.log(`Updating status of room ${id} to ${updateStatusDto.status} by ${user.sub} with ${user.role}`);
    return firstValueFrom(
      this.roomClient.send(ROOMS_PATTERNS.UPDATE_STATUS, {
        id,
        ...updateStatusDto,
        _metadata: {
          userId: user.sub,
          role: user.role
        }
      })
    );
  }

  async getRoomActivityHistory(roomId: number, user: any, params: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }) {
    this.logger.log(`Getting activity history for room ${roomId}`);
    return firstValueFrom(
      this.roomClient.send(ROOMS_PATTERNS.GET_ROOM_ACTIVITY_HISTORY, {
        roomId,
        userId: user.sub,
        role: user.role,
        ...params
      })
    );
  }

  async getRoomUsageStats(roomId: number, params: {
    startDate?: string;
    endDate?: string;
  }) {
    this.logger.log(`Getting usage statistics for room ${roomId}`);
    return firstValueFrom(
      this.roomClient.send(ROOMS_PATTERNS.GET_ROOM_USAGE_STATS, {
        roomId,
        ...params
      })
    );
  }

  async getRoomsReport(params: {
    department?: string;
    startDate?: string;
    endDate?: string;
  }, user: any) {
    this.logger.log(`Getting rooms report for department ${params.department}`);
    return firstValueFrom(
      this.roomClient.send(ROOMS_PATTERNS.GET_ROOMS_REPORT, {
        ...params,
        userId: user.sub,
        role: user.role
      })
    );
  }
}