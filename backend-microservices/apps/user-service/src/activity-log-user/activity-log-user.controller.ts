import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, EventPattern, Payload } from '@nestjs/microservices';
import { ActivityLogUserService } from './activity-log-user.service';
import { ACTIVITY_USER_EVENTS as ACTIVITY_EVENTS, ACTIVITY_USER_PATTERNS as ACTIVITY_PATTERNS } from '@app/contracts/user-service/constants';

@Controller()
export class ActivityLogUserController {
  private readonly logger = new Logger(ActivityLogUserController.name);

  constructor(private readonly activityLogService: ActivityLogUserService) {}

  /**
   * Lắng nghe event khi người dùng đăng nhập
   */
  @EventPattern(ACTIVITY_EVENTS.USER_LOGGED_IN)
  async handleUserLoggedIn(@Payload() data: any) {
    const { userId, email, role, ipAddress, userAgent } = data;

    this.logger.log(`User ${userId} logged in from ${ipAddress}`);

    await this.activityLogService.logActivity(
      userId,              // First parameter: userId
      'USER_LOGGED_IN',    // Second parameter: action
      {                    // Third parameter: details
        email,
        role,
        ipAddress,
        userAgent,
        entityType: 'USER',
        entityId: userId
      }
    );
  }

  /**
   * Lắng nghe event khi người dùng đăng xuất
   */
  @EventPattern(ACTIVITY_EVENTS.USER_LOGGED_OUT)
  async handleUserLoggedOut(@Payload() data: any) {
    const { userId, email, sessionDuration } = data;

    this.logger.log(`User ${userId} logged out after ${sessionDuration} seconds`);

    await this.activityLogService.logActivity(
      userId,              // First parameter: userId
      'USER_LOGGED_OUT',   // Second parameter: action
      {                    // Third parameter: details
        email,
        sessionDuration,
        entityType: 'USER',
        entityId: userId
      }
    );
  }

  /**
   * Lắng nghe event khi tài khoản người dùng được tạo
   */
  @EventPattern(ACTIVITY_EVENTS.USER_CREATED)
  async handleUserCreated(@Payload() data: any) {
    const { userId, email, role, createdBy } = data;

    this.logger.log(`User ${userId} created by ${createdBy || 'system'}`);

    await this.activityLogService.logActivity(
      userId,              // First parameter: userId
      'USER_CREATED',      // Second parameter: action
      {                    // Third parameter: details
        email,
        role,
        createdBy,
        entityType: 'USER',
        entityId: userId
      }
    );
  }

  /**
   * Lắng nghe event khi thông tin người dùng được cập nhật
   */
  @EventPattern(ACTIVITY_EVENTS.PROFILE_UPDATED)
  async handleUserUpdated(@Payload() data: any) {
    const { userId, updatedFields, updatedBy } = data;

    this.logger.log(`User ${userId} updated by ${updatedBy}`);

    await this.activityLogService.logActivity(
      userId,              // First parameter: userId
      'USER_UPDATED',      // Second parameter: action
      {                    // Third parameter: details
        updatedFields: Object.keys(updatedFields),
        updatedBy,
        entityType: 'USER',
        entityId: userId
      }
    );
  }

  /**
   * Lắng nghe event khi mật khẩu người dùng được thay đổi
   */
  @EventPattern(ACTIVITY_EVENTS.PASSWORD_CHANGED)
  async handlePasswordChanged(@Payload() data: any) {
    const { userId, email, requestedBy } = data;

    this.logger.log(`Password changed for user ${userId}`);

    await this.activityLogService.logActivity(
      userId,              // First parameter: userId
      'PASSWORD_CHANGED',  // Second parameter: action
      {                    // Third parameter: details
        email,
        requestedBy: requestedBy || userId,
        entityType: 'USER',
        entityId: userId
      }
    );
  }

  /**
   * Lắng nghe event khi tài khoản bị khóa/mở khóa
   */
  @EventPattern(ACTIVITY_EVENTS.ACCOUNT_STATUS_CHANGED)
  async handleAccountStatusChanged(@Payload() data: any) {
    const { userId, email, active, changedBy, reason } = data;

    this.logger.log(`Account for user ${userId} ${active ? 'activated' : 'deactivated'} by ${changedBy}`);

    await this.activityLogService.logActivity(
      userId,                                      // First parameter: userId
      active ? 'ACCOUNT_ACTIVATED' : 'ACCOUNT_DEACTIVATED',  // Second parameter: action
      {                                            // Third parameter: details
        email,
        changedBy,
        reason,
        entityType: 'USER',
        entityId: userId
      }
    );
  }

  /**
   * Lắng nghe event khi quyền người dùng được thay đổi
   */
  @EventPattern(ACTIVITY_EVENTS.ROLE_CHANGED)
  async handleRoleChanged(@Payload() data: any) {
    const { userId, email, oldRole, newRole, changedBy } = data;

    this.logger.log(`Role for user ${userId} changed from ${oldRole} to ${newRole} by ${changedBy}`);

    await this.activityLogService.logActivity(
      userId,              // First parameter: userId
      'ROLE_CHANGED',      // Second parameter: action
      {                    // Third parameter: details
        email,
        oldRole,
        newRole,
        changedBy,
        entityType: 'USER',
        entityId: userId
      }
    );
  }

  /**
   * API để lấy lịch sử hoạt động của người dùng
   */
  @MessagePattern(ACTIVITY_PATTERNS.GET_USER_ACTIVITY)
  async getUserActivity(@Payload() data: any) {
    const { userId, currentUserId, role, page, limit, action } = data;

    this.logger.log(`Getting activity for user ${userId} by user ${currentUserId}`);

    // Kiểm tra quyền truy cập
    if (userId !== currentUserId && role !== 'ADMIN' && role !== 'TEACHER') {
      return {
        success: false,
        message: 'Unauthorized to view this user\'s activity'
      };
    }

    try {
      const result = await this.activityLogService.getUserActivity(
        userId,
        page || 1,
        limit || 10,
        { action }
      );

      return {
        success: true,
        data: result
      };
    } catch (error) {
      this.logger.error(`Error getting user activity: ${error.message}`);
      return {
        success: false,
        message: 'Failed to retrieve user activity',
        error: error.message
      };
    }
  }

  /**
   * API để lấy lịch sử sử dụng phòng của người dùng
   */
  @MessagePattern(ACTIVITY_PATTERNS.GET_USER_ROOM_USAGE)
  async getUserRoomUsage(@Payload() data: any) {
    const { userId, currentUserId, role, page, limit, startDate, endDate } = data;

    this.logger.log(`Getting room usage for user ${userId} by user ${currentUserId}`);

    // Kiểm tra quyền truy cập
    if (userId !== currentUserId && role !== 'ADMIN' && role !== 'TEACHER') {
      return {
        success: false,
        message: 'Unauthorized to view this user\'s room usage'
      };
    }

    try {
      const dateRange = startDate || endDate ? {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined
      } : undefined;

      const result = await this.activityLogService.getUserRoomUsage(
        userId,
        page || 1,
        limit || 10,
        dateRange
      );

      return {
        success: true,
        data: result
      };
    } catch (error) {
      this.logger.error(`Error getting user room usage: ${error.message}`);
      return {
        success: false,
        message: 'Failed to retrieve user room usage',
        error: error.message
      };
    }
  }

  /**
   * API để lấy thống kê sử dụng phòng
   */
  @MessagePattern(ACTIVITY_PATTERNS.GET_ROOM_USAGE_STATS)
  async getRoomUsageStats(@Payload() data: any) {
    const { startDate, endDate, page, limit } = data;

    this.logger.log(`Getting room usage statistics from ${startDate} to ${endDate}`);

    try {
      const result = await this.activityLogService.getRoomUsageStatistics(
        new Date(startDate), 
        new Date(endDate),
        page || 1,
        limit || 10
      );

      return {
        success: true,
        data: result
      };
    } catch (error) {
      this.logger.error(`Error getting room usage stats: ${error.message}`);
      return {
        success: false,
        message: 'Failed to retrieve room usage statistics',
        error: error.message
      };
    }
  }
}