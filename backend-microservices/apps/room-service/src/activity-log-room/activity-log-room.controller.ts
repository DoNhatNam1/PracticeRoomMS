import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, EventPattern, Payload } from '@nestjs/microservices';
import { ActivityLogRoomService } from './activity-log-room.service';
import {SCHEDULES_EVENTS, ROOMS_PATTERNS, SCHEDULES_PATTERNS } from '@app/contracts/room-service';
import { Role } from '@prisma/client';
import { ROOM_USAGE_EVENTS } from '@app/contracts/room-service/room-usage/constants';

@Controller()
export class ActivityLogRoomController {
  private readonly logger = new Logger(ActivityLogRoomController.name);

  constructor(private readonly activityLogService: ActivityLogRoomService) {}

  /**
   * Lắng nghe event khi phòng được đặt
   */
  @EventPattern(SCHEDULES_EVENTS.SCHEDULED)
  async handleRoomScheduled(@Payload() data: any) {
    const { roomId, userId, scheduleId, title, startTime, endTime, teacherId, roomName } = data;

    this.logger.log(`Room ${roomId} scheduled by user ${userId}`);

    await this.activityLogService.logActivity(
      userId,
      'ROOM_SCHEDULED',
      { 
        roomId,
        roomName,
        title,
        scheduleId,
        startTime,
        endTime,
        entityType: 'SCHEDULE',
        entityId: scheduleId
      },
      teacherId || null
    );
  }

  /**
   * Lắng nghe event khi trạng thái lịch đặt phòng thay đổi
   */
  @EventPattern(SCHEDULES_EVENTS.STATUS_UPDATED)
  async handleScheduleStatusChanged(@Payload() data: any) {
    const { roomId, userId, scheduleId, status, previousStatus, schedule, visibleToId } = data;

    this.logger.log(`Schedule ${scheduleId} for room ${roomId} status changed to ${status}`);

    await this.activityLogService.logActivity(
      userId,
      `SCHEDULE_${status}`,
      { 
        roomId,
        roomName: schedule?.room?.name,
        status,
        previousStatus,
        title: schedule?.title,
        startTime: schedule?.startTime,
        endTime: schedule?.endTime,
        entityType: 'SCHEDULE',
        entityId: scheduleId
      },
      visibleToId
    );
  }

  /**
   * Lắng nghe event khi phòng được sử dụng
   */
  @EventPattern(ROOM_USAGE_EVENTS.STARTED)
  async handleRoomUsageStarted(@Payload() data: any) {
    const { roomId, userId, teacherId, roomName, purpose } = data;

    this.logger.log(`Room ${roomId} usage started by user ${userId}`);

    await this.activityLogService.logActivity(
      userId,
      'ROOM_USAGE_STARTED',
      {
        roomId,
        roomName,
        purpose,
        startTime: new Date(),
        entityType: 'ROOM',
        entityId: roomId
      },
      teacherId || null
    );
  }

  /**
   * Lắng nghe event khi phòng kết thúc sử dụng
   */
  @EventPattern(ROOM_USAGE_EVENTS.ENDED)
  async handleRoomUsageEnded(@Payload() data: any) {
    const { roomId, userId, sessionId, duration, teacherId, roomName } = data;

    this.logger.log(`Room ${roomId} usage ended by user ${userId}, duration: ${duration}`);

    await this.activityLogService.logActivity(
      userId,
      'ROOM_USAGE_ENDED',
      {
        roomId,
        roomName,
        sessionId,
        duration,
        endTime: new Date(),
        entityType: 'ROOM',
        entityId: roomId
      },
      teacherId || null
    );
  }

  /**
   * Lắng nghe event khi phòng bảo trì
   */
  @EventPattern(ROOM_USAGE_EVENTS.MAINTENANCE)
  async handleRoomMaintenance(@Payload() data: any) {
    const { roomId, userId, reason, startTime, endTime, roomName } = data;

    this.logger.log(`Room ${roomId} set for maintenance by user ${userId}`);

    await this.activityLogService.logActivity(
      userId,
      'ROOM_MAINTENANCE',
      {
        roomId,
        roomName,
        reason,
        startTime,
        endTime,
        entityType: 'ROOM',
        entityId: roomId
      },
      null // Chỉ admin xem được thông tin bảo trì
    );
  }

  /**
   * API để lấy lịch sử hoạt động của phòng
   */
  @MessagePattern(ROOMS_PATTERNS.GET_ROOM_ACTIVITY_HISTORY)
  async getRoomHistory(@Payload() data: any) {
    const { roomId, userId, role, page, limit, startDate, endDate } = data;

    this.logger.log(`Getting activity history for room ${roomId} by user ${userId}`);

    return this.activityLogService.getRoomActivityHistory(
      roomId, 
      { id: userId, role: role as Role },
      {
        page,
        limit,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      }
    );
  }

  /**
   * API để lấy lịch sử hoạt động của lịch đặt phòng
   */
  @MessagePattern(SCHEDULES_PATTERNS.GET_ACTIVITY_HISTORY)
  async getScheduleHistory(@Payload() data: any) {
    const { scheduleId, userId, role, page, limit } = data;

    this.logger.log(`Getting activity history for schedule ${scheduleId} by user ${userId}`);

    return this.activityLogService.getScheduleActivityHistory(
      scheduleId,
      { id: userId, role: role as Role },
      {
        page,
        limit
      }
    );
  }

  /**
   * API để lấy lịch sử hoạt động của người dùng với phòng học
   */
  @MessagePattern(ROOMS_PATTERNS.GET_USER_ROOM_ACTIVITIES)
  async getUserRoomActivities(@Payload() data: any) {
    const { targetUserId, currentUserId, role, page, limit, startDate, endDate } = data;

    this.logger.log(`Getting room activities for user ${targetUserId} by user ${currentUserId}`);

    return this.activityLogService.getUserActivity(
      targetUserId,
      { id: currentUserId, role: role as Role },
      {
        page,
        limit,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      }
    );
  }

  /**
   * API để lấy thống kê sử dụng phòng học
   */
  @MessagePattern(ROOMS_PATTERNS.GET_ROOM_USAGE_STATS)
  async getRoomUsageStats(@Payload() data: any) {
    const { roomId, startDate, endDate } = data;

    this.logger.log(`Getting usage statistics for room ${roomId}`);

    // Gọi service tương ứng (chưa triển khai)
    return { message: 'Not implemented yet' };
  }

  /**
   * API để lấy báo cáo phòng học theo thời gian
   */
  @MessagePattern(ROOMS_PATTERNS.GET_ROOMS_REPORT)
  async getRoomsReport(@Payload() data: any) {
    const { department, startDate, endDate, userId, role } = data;

    this.logger.log(`Getting rooms report for department ${department} by user ${userId}`);

    // Gọi service tương ứng (chưa triển khai)
    return { message: 'Not implemented yet' };
  }
}