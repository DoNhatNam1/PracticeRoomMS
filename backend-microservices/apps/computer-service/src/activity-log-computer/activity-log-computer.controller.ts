import { Controller, Logger } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { ActivityLogComputerService } from './activity-log-computer.service';
import {
  COMPUTER_ACTIVITY_PATTERNS,
  COMPUTER_ACTIVITY_EVENTS,
} from '@app/contracts/computer-service/activity/constants';
import { Role } from '@prisma/client';

@Controller()
export class ActivityLogComputerController {
  private readonly logger = new Logger(ActivityLogComputerController.name);

  constructor(
    private readonly activityLogComputerService: ActivityLogComputerService,
  ) {}

  /**
   * Lắng nghe event khi chuyển file
   */
  @EventPattern(COMPUTER_ACTIVITY_EVENTS.FILE_TRANSFER_COMPLETED)
  async handleFileTransferCompleted(@Payload() data: any) {
    const {
      fileTransferId,
      userId,
      fileName,
      fileSize,
      sourceComputerId,
      targetComputerId,
    } = data;

    this.logger.log(`File ${fileName} transferred by user ${userId}`);

    await this.activityLogComputerService.logActivity(
      userId,
      'FILE_TRANSFER_COMPLETED',
      'FILE_TRANSFER',
      fileTransferId,
      {
        fileName,
        fileSize,
        sourceComputerId,
        targetComputerId,
        ...data,
      },
      data.teacherId || null,
    );
  }

  /**
   * Log when computer status changes
   */
  @EventPattern(COMPUTER_ACTIVITY_EVENTS.STATUS_CHANGED)
  async handleStatusChanged(@Payload() data: any) {
    const { computerId, userId, oldStatus, newStatus } = data;

    this.logger.log(
      `Computer ${computerId} status changed from ${oldStatus} to ${newStatus} by user ${userId}`,
    );

    await this.activityLogComputerService.logActivity(
      userId,
      'STATUS_CHANGED',
      'COMPUTER',
      computerId,
      { oldStatus, newStatus, ...data },
      data.teacherId || null,
    );
  }

  /**
   * Log when computer is assigned to a user
   */
  @EventPattern(COMPUTER_ACTIVITY_EVENTS.ASSIGNED_TO_USER)
  async handleAssignedToUser(@Payload() data: any) {
    const { computerId, userId, assignedUserId } = data;

    this.logger.log(
      `Computer ${computerId} assigned to user ${assignedUserId} by ${userId}`,
    );

    await this.activityLogComputerService.logActivity(
      userId,
      'ASSIGNED_TO_USER',
      'COMPUTER',
      computerId,
      { assignedUserId, ...data },
      data.teacherId || null,
    );
  }

  /**
   * Log when computer is released from a user
   */
  @EventPattern(COMPUTER_ACTIVITY_EVENTS.RELEASED_FROM_USER)
  async handleReleasedFromUser(@Payload() data: any) {
    const { computerId, userId, releasedUserId, duration } = data;

    this.logger.log(
      `Computer ${computerId} released from user ${releasedUserId} by ${userId}`,
    );

    await this.activityLogComputerService.logActivity(
      userId,
      'RELEASED_FROM_USER',
      'COMPUTER',
      computerId,
      { releasedUserId, duration, ...data },
      data.teacherId || null,
    );
  }

  /**
   * Log when computer is added to a room
   */
  @EventPattern(COMPUTER_ACTIVITY_EVENTS.ADDED_TO_ROOM)
  async handleAddedToRoom(@Payload() data: any) {
    const { computerId, userId, roomId, roomName } = data;

    this.logger.log(
      `Computer ${computerId} added to room ${roomName} by user ${userId}`,
    );

    await this.activityLogComputerService.logActivity(
      userId,
      'ADDED_TO_ROOM',
      'COMPUTER',
      computerId,
      { roomId, roomName, ...data },
      data.teacherId || null,
    );
  }

  /**
   * Log when computer is scheduled for maintenance
   */
  @EventPattern(COMPUTER_ACTIVITY_EVENTS.MAINTENANCE_SCHEDULED)
  async handleMaintenanceScheduled(@Payload() data: any) {
    const { computerId, userId, maintenanceDetails } = data;

    this.logger.log(
      `Maintenance scheduled for computer ${computerId} by user ${userId}`,
    );

    await this.activityLogComputerService.logActivity(
      userId,
      'MAINTENANCE_SCHEDULED',
      'COMPUTER',
      computerId,
      { maintenanceDetails, ...data },
      data.teacherId || null,
    );
  }

  /**
   * Lấy lịch sử hoạt động của máy tính
   */
  @MessagePattern(COMPUTER_ACTIVITY_PATTERNS.GET_COMPUTER_ACTIVITY)
  async getComputerActivity(@Payload() data: any) {
    try {
      const { _metadata, id, page = 1, limit = 10, startDate, endDate } = data;

      // Validate and convert id to number
      const computerId = +id;

      if (!computerId || isNaN(computerId)) {
        return {
          success: false,
          message: 'Valid computer ID is required',
          statusCode: 400,
        };
      }

      this.logger.log(`Retrieving activity history for computer ${computerId}`);

      // Pass numeric ID explicitly
      return this.activityLogComputerService.getComputerActivityHistory(
        computerId,
        { page, limit, startDate, endDate },
      );
    } catch (error) {
      this.logger.error(`Error retrieving computer activity: ${error.message}`);
      return {
        success: false,
        message: 'Failed to retrieve computer activity history',
        error: error.message,
      };
    }
  }
  /**
   * Lấy lịch sử chuyển file của một fileTransferId
   */
  @MessagePattern(COMPUTER_ACTIVITY_PATTERNS.GET_FILE_TRANSFER_ACTIVITY)
  async getFileTransferActivity(@Payload() data: any) {
    const { fileTransferId, userId, role, page, limit } = data;

    this.logger.log(`Getting activity for file transfer ${fileTransferId}`);

    return this.activityLogComputerService.getFileTransferActivityHistory(
      fileTransferId,
      { id: userId, role: role as Role },
      {
        page,
        limit,
      },
    );
  }

  /**
   * Lấy hoạt động máy tính của người dùng
   */
  @MessagePattern(COMPUTER_ACTIVITY_PATTERNS.GET_USER_COMPUTER_ACTIVITIES)
  async getUserComputerActivities(@Payload() data: any) {
    const {
      userId,
      currentUserId,
      role,
      page,
      limit,
      startDate,
      endDate,
      computerIds,
    } = data;

    this.logger.log(`Getting computer activities for user ${userId}`);

    return this.activityLogComputerService.getUserComputerActivities(
      userId,
      { id: currentUserId, role: role as Role },
      {
        page,
        limit,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        computerIds,
      },
    );
  }

  /**
   * Lấy thống kê sử dụng máy tính của người dùng
   */
  @MessagePattern(COMPUTER_ACTIVITY_PATTERNS.GET_COMPUTER_USAGE_STATS)
  async getComputerUsageStats(@Payload() data: any) {
    const { userId, startDate, endDate } = data;

    this.logger.log(`Getting computer usage stats for user ${userId}`);

    return this.activityLogComputerService.getComputerUsageStatsByUser(userId, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }
}
