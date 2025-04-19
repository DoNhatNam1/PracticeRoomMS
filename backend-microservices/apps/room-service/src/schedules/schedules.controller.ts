import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, EventPattern } from '@nestjs/microservices';
import { SchedulesService } from './schedules.service';
import { SCHEDULES_PATTERNS } from '@app/contracts/room-service/schedules/constants';

@Controller()
export class SchedulesController {
  private readonly logger = new Logger(SchedulesController.name);

  constructor(private readonly schedulesService: SchedulesService) {}

  /**
   * Tạo lịch phòng học mới
   * - Input: roomId, title, startTime, endTime, userId, userRole, repeat (optional)
   * - Output: Lịch phòng đã được tạo
   */
  @MessagePattern(SCHEDULES_PATTERNS.CREATE)
  async create(data: any) {
    this.logger.log(`Creating schedule: ${JSON.stringify(data)}`);
    return this.schedulesService.create(data);
  }

  /**
   * Duyệt lịch phòng học
   * - Input: scheduleId, userId, userRole
   * - Output: Lịch phòng đã được duyệt
   */
  @MessagePattern(SCHEDULES_PATTERNS.APPROVE)
  async approve(data: any) {
    this.logger.log(`Approving schedule ${data.scheduleId}`);
    return this.schedulesService.approveSchedule({
      scheduleId: data.scheduleId,
      status: 'APPROVED',
      userId: data.userId,
      userRole: data.userRole,
    });
  }

  /**
   * Từ chối lịch phòng học
   */
  @MessagePattern(SCHEDULES_PATTERNS.REJECT)
  async reject(data: any) {
    this.logger.log(`Rejecting schedule ${data.scheduleId}`);
    return this.schedulesService.approveSchedule({
      scheduleId: data.scheduleId,
      status: 'REJECTED',
      userId: data.userId,
      userRole: data.userRole,
    });
  }

  /**
   * Hủy lịch phòng học
   * - Input: scheduleId, userId, userRole
   * - Output: Lịch phòng đã bị hủy
   */
  @MessagePattern(SCHEDULES_PATTERNS.CANCEL)
  async cancel(data: any) {
    this.logger.log(`Cancelling schedule ${data.scheduleId}`);
    return this.schedulesService.cancelSchedule({
      scheduleId: data.scheduleId,
      userId: data.userId,
      userRole: data.userRole,
    });
  }

  /**
   * Kiểm tra xung đột lịch phòng
   * - Input: roomId, startTime, endTime, excludeScheduleId (optional)
   * - Output: Danh sách các lịch xung đột
   */
  @MessagePattern(SCHEDULES_PATTERNS.CHECK_CONFLICTS)
  async checkConflicts(data: any) {
    this.logger.log(
      `Checking conflicts for room ${data.roomId}: ${JSON.stringify(data)}`,
    );
    return this.schedulesService.checkScheduleConflicts({
      roomId: data.roomId,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      excludeScheduleId: data.excludeScheduleId,
    });
  }
}
