import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@app/prisma/prisma.service';
import { ActivityLogRoomService } from '../activity-log-room/activity-log-room.service';

@Injectable()
export class RoomUsageService {
  private readonly logger = new Logger(RoomUsageService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogRoomService: ActivityLogRoomService
  ) {}

  async startUsage(data: any) {
    const { roomId, userId, startTime } = data;

    // Logic bắt đầu sử dụng phòng
    const usage = await this.prisma.roomUsage.create({
      data: {
        roomId,
        userId,
        startTime: new Date(startTime),
      },
    });

    return usage;
  }

  async endUsage(data: any) {
    const { usageId, endTime } = data;

    // Logic kết thúc sử dụng phòng
    const usage = await this.prisma.roomUsage.update({
      where: { id: usageId },
      data: {
        endTime: new Date(endTime),
      },
    });

    return usage;
  }


  /**
   * Lấy lịch sử sử dụng phòng
   */
  async getRoomActivityHistory(roomId: number, options?: { 
    page?: number; 
    limit?: number;
    startDate?: Date;
    endDate?: Date;
  }) {
    const { page = 1, limit = 10, startDate, endDate } = options || {};
    const skip = (page - 1) * limit;

    const where: any = { roomId };

    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) where.startTime.gte = startDate;
      if (endDate) where.startTime.lte = endDate;
    }

    const [usages, total] = await Promise.all([
      this.prisma.roomUsage.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          startTime: 'desc',
        },
      }),
      this.prisma.roomUsage.count({ where }),
    ]);

    return {
      data: usages,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async markForMaintenance(
    roomId: number, 
    maintenanceData: any, 
    currentUser: any
  ) {
    try {
      // Validate user permissions
      if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'TEACHER')) {
        return {
          success: false,
          message: 'Unauthorized to schedule maintenance',
          statusCode: 403
        };
      }
      
      // Check if room exists
      const room = await this.prisma.room.findUnique({
        where: { id: roomId }
      });
      
      if (!room) {
        return {
          success: false,
          message: 'Room not found',
          statusCode: 404
        };
      }
      
      // Convert string dates to Date objects
      const startTime = new Date(maintenanceData.startTime);
      const endTime = new Date(maintenanceData.endTime);
      
      // Validate date range
      if (startTime >= endTime) {
        return {
          success: false,
          message: 'Start time must be before end time',
          statusCode: 400
        };
      }
      
      // Check for conflicts with existing schedules
      const conflicts = await this.prisma.schedule.findMany({
        where: {
          roomId,
          status: { not: 'REJECTED' },
          OR: [
            {
              startTime: { lt: endTime },
              endTime: { gt: startTime }
            }
          ]
        }
      });
      
      if (conflicts.length > 0) {
        return {
          success: false,
          message: 'Maintenance period conflicts with existing schedules',
          statusCode: 409,
          data: { conflicts }
        };
      }
      
      // Create maintenance record with correct schema fields
      const maintenance = await this.prisma.roomUsage.create({
        data: {
          roomId,
          purpose: maintenanceData.reason,
          startTime,
          endTime,
          userId: currentUser.sub,
        }
      });

// Update room status separately (since status is on Room model, not RoomUsage)
await this.prisma.room.update({
  where: { id: roomId },
  data: { status: 'MAINTENANCE' }
});
      // Update room status to MAINTENANCE
      await this.prisma.room.update({
        where: { id: roomId },
        data: { status: 'MAINTENANCE' }
      });
      
      // Log activity
      await this.activityLogRoomService.logActivity(
        currentUser.sub,
        'ROOM_MAINTENANCE_SCHEDULED',
        {
          entityType: 'ROOM',
          entityId: roomId,
          roomName: room.name,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          reason: maintenanceData.reason
        },
        null
      );
      
      return {
        success: true,
        message: 'Room marked for maintenance successfully',
        data: maintenance
      };
    } catch (error) {
      this.logger.error(`Error marking room ${roomId} for maintenance: ${error.message}`);
      return {
        success: false,
        message: 'Failed to mark room for maintenance',
        error: error.message
      };
    }
  }
}