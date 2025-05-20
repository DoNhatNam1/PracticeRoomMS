import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SchedulesService } from './schedules.service';
import { SCHEDULES_PATTERNS } from '@app/contracts/room-service';

@Controller()
export class SchedulesController {
  private readonly logger = new Logger(SchedulesController.name);

  constructor(private readonly schedulesService: SchedulesService) {}

  @MessagePattern(SCHEDULES_PATTERNS.FIND_ALL)
  async findAll(@Payload() payload: any) {
    this.logger.log(`Finding all schedules with params: ${JSON.stringify(payload)}`);
    const { page = 1, limit = 10, currentUser } = payload;
    return this.schedulesService.findAll(page, limit, currentUser);
  }

  @MessagePattern(SCHEDULES_PATTERNS.FIND_ONE)
  async findOne(@Payload() payload: any) {
    const { id, currentUser } = payload;
    this.logger.log(`Finding schedule with ID: ${id}`);
    return this.schedulesService.findOne(id, currentUser);
  }

  @MessagePattern(SCHEDULES_PATTERNS.CREATE)
  async create(@Payload() payload: any) {
    this.logger.log(`Creating schedule: ${JSON.stringify(payload)}`);
    return this.schedulesService.create(payload);
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
    this.logger.log(`Cancelling schedule ${data.id}`); 
    return this.schedulesService.cancelSchedule({
      scheduleId: data.id,
      userId: data.userId,  
      userRole: data.userRole 
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

  @MessagePattern(SCHEDULES_PATTERNS.UPDATE)
  async update(@Payload() payload: any) {
    const { id, updateScheduleDto, currentUser } = payload;
    
    // Add debugging logs
    this.logger.debug(`Update schedule payload: ${JSON.stringify(payload)}`);
    this.logger.debug(`Current user from payload: ${JSON.stringify(currentUser)}`);
    
    return this.schedulesService.update(id, updateScheduleDto, currentUser);
  }
}
