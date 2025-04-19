import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ROOM_SERVICE_CLIENT } from '../constant';
import { SCHEDULES_PATTERNS } from '@app/contracts/room-service';
import { CheckConflictDto, CreateScheduleDto, UpdateScheduleDto } from '../dto';

@Injectable()
export class SchedulesService {
  private readonly logger = new Logger(SchedulesService.name);

  constructor(
    @Inject(ROOM_SERVICE_CLIENT) private roomClient: ClientProxy,
  ) {}

  async findAll(params: {
    page: number;
    limit: number;
    filters?: any;
    user: any;
  }) {
    this.logger.log(`Finding all schedules with params: ${JSON.stringify(params)}`);
    return firstValueFrom(
      this.roomClient.send(SCHEDULES_PATTERNS.FIND_ALL, {
        ...params,
        userId: params.user.sub,
        userRole: params.user.role,
      }),
    );
  }

  async findOne(id: number, user: any) {
    this.logger.log(`Finding schedule with id: ${id}`);
    return firstValueFrom(
      this.roomClient.send(SCHEDULES_PATTERNS.FIND_ONE, {
        id,
        userId: user.sub,
        userRole: user.role,
      }),
    );
  }

  async create(createScheduleDto: CreateScheduleDto, user: any) {
    this.logger.log(`Creating new schedule: ${JSON.stringify(createScheduleDto)}`);
    return firstValueFrom(
      this.roomClient.send(SCHEDULES_PATTERNS.CREATE, {
        ...createScheduleDto,
        userId: user.sub,
        userRole: user.role,
      }),
    );
  }

  async update(id: number, updateScheduleDto: UpdateScheduleDto, user: any) {
    this.logger.log(`Updating schedule ${id}: ${JSON.stringify(updateScheduleDto)}`);
    return firstValueFrom(
      this.roomClient.send(SCHEDULES_PATTERNS.UPDATE, {
        id,
        ...updateScheduleDto,
        userId: user.sub,
        userRole: user.role,
      }),
    );
  }

  async updateStatus(id: number, status: string, user: any) {
    this.logger.log(`Updating status of schedule ${id} to ${status}`);
    return firstValueFrom(
      this.roomClient.send(SCHEDULES_PATTERNS.UPDATE_STATUS, {
        id,
        status,
        userId: user.sub,
        userRole: user.role,
      }),
    );
  }

  async checkConflicts(checkConflictDto: CheckConflictDto) {
    this.logger.log(`Checking schedule conflicts: ${JSON.stringify(checkConflictDto)}`);
    return firstValueFrom(
      this.roomClient.send(SCHEDULES_PATTERNS.CHECK_CONFLICTS, checkConflictDto)
    );
  }

  async getRoomSchedules(roomId: number, startDate: string, endDate: string) {
    this.logger.log(`Getting schedules for room ${roomId} from ${startDate} to ${endDate}`);
    return firstValueFrom(
      this.roomClient.send(SCHEDULES_PATTERNS.GET_ROOM_SCHEDULES, {
        roomId,
        startDate,
        endDate
      })
    );
  }

  async cancel(id: number, user: any) {
    this.logger.log(`Cancelling schedule ${id}`);
    return firstValueFrom(
      this.roomClient.send(SCHEDULES_PATTERNS.UPDATE_STATUS, {
        id,
        status: 'CANCELLED',
        userId: user.sub,
        userRole: user.role
      })
    );
  }

  /**
   * Lấy lịch sử hoạt động của một lịch đặt phòng
   */
  async getActivityHistory(
    scheduleId: number, 
    user: any, 
    options: { page?: number; limit?: number }
  ) {
    this.logger.log(`Getting activity history for schedule ${scheduleId}`);
    return firstValueFrom(
      this.roomClient.send(SCHEDULES_PATTERNS.GET_ACTIVITY_HISTORY, {
        scheduleId,
        userId: user.sub,
        role: user.role,
        ...options
      })
    );
  }
}