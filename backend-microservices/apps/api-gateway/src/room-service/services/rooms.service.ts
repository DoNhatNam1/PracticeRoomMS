import { Inject, Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
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

  /**
   * Find all rooms for dashboard view (admin/teacher)
   * Includes full details, pagination, and comprehensive filtering
   */
  async findAllForDashboard(params: {
    page: number;
    limit: number;
    filters?: {
      status?: string;
      type?: string;
      building?: string;
      search?: string;
      isActive?: boolean;
    };
  }) {
    try {
      const { page, limit, filters = {} } = params;
      
      // Use ROOM_PATTERNS constant instead of hardcoded command
      const result = await firstValueFrom(
        this.roomClient.send(ROOMS_PATTERNS.FIND_ALL_DASHBOARD, { page, limit, filters })
      );
      
      return result;
    } catch (error) {
      this.logger.error(`Error finding rooms for dashboard: ${error.message}`);
      throw new InternalServerErrorException('Failed to retrieve rooms');
    }
  }

  /**
   * Find all rooms for client view
   * Shows limited information, no pagination, focuses on availability
   */
  async findAllForClient(params: {
    filters?: {
      status?: string;
      building?: string;
      isActive?: boolean;
    };
  }) {
    try {
      const { filters = {} } = params;
      
      // Use ROOM_PATTERNS constant instead of hardcoded command
      const result = await firstValueFrom(
        this.roomClient.send(ROOMS_PATTERNS.FIND_ALL_CLIENT, { filters })
      );
      
      return result;
    } catch (error) {
      this.logger.error(`Error finding rooms for client view: ${error.message}`);
      throw new InternalServerErrorException('Failed to retrieve rooms');
    }
  }

  async findOne(id: number) {
    this.logger.log(`Finding room with id: ${id}`);
    return firstValueFrom(
      this.roomClient.send(ROOMS_PATTERNS.FIND_ONE, { id })
    );
  }

  async findOnePublic(id: number) {
    this.logger.log(`Finding public info for room with id: ${id}`);
    return firstValueFrom(
      this.roomClient.send(ROOMS_PATTERNS.FIND_ONE_PUBLIC, { id })
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