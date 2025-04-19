import { Controller, Logger } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { ActivityLogComputerService } from './activity-log-computer.service';
import { COMPUTER_EVENTS, COMPUTER_PATTERNS } from '@app/contracts/computer-service';
import { Role } from '@prisma/client';

@Controller()
export class ActivityLogComputerController {
  private readonly logger = new Logger(ActivityLogComputerController.name);
  
  constructor(private readonly activityLogComputerService: ActivityLogComputerService) {}

  /**
   * Lắng nghe event khi máy tính được sử dụng
   */
  @EventPattern(COMPUTER_EVENTS.USAGE_STARTED)
  async handleComputerUsageStarted(@Payload() data: any) {
    const { computerId, userId } = data;

    this.logger.log(`Computer ${computerId} usage started by user ${userId}`);

    await this.activityLogComputerService.logActivity(
      userId,
      'COMPUTER_USAGE_STARTED',
      'COMPUTER',
      computerId,
      data,
      data.teacherId || null
    );
  }

  /**
   * Lắng nghe event khi kết thúc sử dụng máy tính
   */
  @EventPattern(COMPUTER_EVENTS.USAGE_ENDED)
  async handleComputerUsageEnded(@Payload() data: any) {
    const { computerId, userId, sessionId, duration } = data;

    this.logger.log(`Computer ${computerId} usage ended by user ${userId}, duration: ${duration}`);

    await this.activityLogComputerService.logActivity(
      userId,
      'COMPUTER_USAGE_ENDED',
      'COMPUTER',
      computerId,
      { sessionId, duration, ...data },
      data.teacherId || null
    );
  }

  /**
   * Lắng nghe event khi phần mềm được cài đặt
   */
  @EventPattern(COMPUTER_EVENTS.SOFTWARE_INSTALLED)
  async handleSoftwareInstalled(@Payload() data: any) {
    const { computerId, userId, softwareId, softwareName } = data;

    this.logger.log(`Software ${softwareName} installed on computer ${computerId} by user ${userId}`);

    await this.activityLogComputerService.logActivity(
      userId,
      'SOFTWARE_INSTALLED',
      'COMPUTER',
      computerId,
      { softwareId, softwareName, ...data },
      data.teacherId || null
    );
  }

  /**
   * Lắng nghe event khi phần mềm được gỡ cài đặt
   */
  @EventPattern(COMPUTER_EVENTS.SOFTWARE_UNINSTALLED)
  async handleSoftwareUninstalled(@Payload() data: any) {
    const { computerId, userId, softwareId, softwareName } = data;

    this.logger.log(`Software ${softwareName} uninstalled from computer ${computerId} by user ${userId}`);

    await this.activityLogComputerService.logActivity(
      userId,
      'SOFTWARE_UNINSTALLED',
      'COMPUTER',
      computerId,
      { softwareId, softwareName, ...data },
      data.teacherId || null
    );
  }

  /**
   * Lắng nghe event khi chuyển file
   */
  @EventPattern(COMPUTER_EVENTS.FILE_TRANSFERRED)
  async handleFileTransferred(@Payload() data: any) {
    const { fileTransferId, userId, fileName, fileSize, sourceComputerId, targetComputerId } = data;

    this.logger.log(`File ${fileName} transferred by user ${userId}`);

    await this.activityLogComputerService.logActivity(
      userId,
      'FILE_TRANSFERRED',
      'FILE_TRANSFER',
      fileTransferId,
      { 
        fileName, 
        fileSize, 
        sourceComputerId, 
        targetComputerId,
        ...data 
      },
      data.teacherId || null
    );
  }

  /**
   * Lấy lịch sử hoạt động của máy tính
   */
  @MessagePattern(COMPUTER_PATTERNS.GET_COMPUTER_ACTIVITY)
  async getComputerActivityHistory(@Payload() data: any) {
    const { computerId, userId, role, page, limit, startDate, endDate } = data;
    
    this.logger.log(`Getting activity history for computer ${computerId}`);
    
    return this.activityLogComputerService.getComputerActivityHistory(
      computerId,
      { id: userId, role: role as Role },
      {
        page,
        limit,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined
      }
    );
  }

  /**
   * Lấy lịch sử chuyển file của một fileTransferId
   */
  @MessagePattern(COMPUTER_PATTERNS.GET_FILE_TRANSFER_ACTIVITY)
  async getFileTransferActivity(@Payload() data: any) {
    const { fileTransferId, userId, role, page, limit } = data;
    
    this.logger.log(`Getting activity for file transfer ${fileTransferId}`);
    
    return this.activityLogComputerService.getFileTransferActivityHistory(
      fileTransferId,
      { id: userId, role: role as Role },
      {
        page,
        limit
      }
    );
  }

  /**
   * Lấy hoạt động máy tính của người dùng
   */
  @MessagePattern(COMPUTER_PATTERNS.GET_USER_COMPUTER_ACTIVITIES)
  async getUserComputerActivities(@Payload() data: any) {
    const { userId, currentUserId, role, page, limit, startDate, endDate, computerIds } = data;
    
    this.logger.log(`Getting computer activities for user ${userId}`);
    
    return this.activityLogComputerService.getUserComputerActivities(
      userId,
      { id: currentUserId, role: role as Role },
      {
        page,
        limit,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        computerIds
      }
    );
  }

  /**
   * Lấy thống kê sử dụng máy tính của người dùng
   */
  @MessagePattern(COMPUTER_PATTERNS.GET_COMPUTER_USAGE_STATS)
  async getComputerUsageStats(@Payload() data: any) {
    const { userId, startDate, endDate } = data;
    
    this.logger.log(`Getting computer usage stats for user ${userId}`);
    
    return this.activityLogComputerService.getComputerUsageStatsByUser(
      userId,
      {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined
      }
    );
  }
}