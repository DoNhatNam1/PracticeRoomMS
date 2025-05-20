import { PrismaService } from '@app/prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ActivityLogUserService {
  private readonly logger = new Logger(ActivityLogUserService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Ghi nhật ký hoạt động
   * @param userId ID người thực hiện hành động (có thể null nếu không có người dùng)
   * @param action Loại hành động
   * @param details Chi tiết (có thể chứa bất kỳ thông tin nào trong JSON)
   * @param visibleToId ID người có thể xem hành động này
   */
  async logActivity(
    userId: number | null,
    action: string,
    details: any,
    visibleToId: number | null = null,
  ) {
    try {
      const activityData: any = {
        action,
        details,
        createdAt: new Date(),
      };

      // Set actor ID directly if provided
      if (userId !== null) {
        activityData.actorId = userId;
      }

      // Set visibleTo ID directly if provided
      if (visibleToId !== null) {
        activityData.visibleToId = visibleToId;
      }

      // Log the data we're sending for debugging
      this.logger.debug(
        `Creating activity log: ${JSON.stringify(activityData)}`,
      );

      return this.prisma.activity.create({
        data: activityData,
      });
    } catch (error) {
      this.logger.error(`Error logging activity: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Lấy nhật ký hoạt động của người dùng
   * @param userId ID người dùng
   * @param page Trang
   * @param limit Số lượng mỗi trang
   * @param filters Bộ lọc
   */
  async getUserActivity(
    userId: number,
    page = 1,
    limit = 10,
    filters: { action?: string } = {},
  ) {
    const skip = (page - 1) * limit;

    try {
      // Search for activities where the user is either the actor OR mentioned in details
      const where = {
        AND: [
          {
            OR: [
              { actorId: userId }, // Check actorId field
              {
                details: {
                  path: ['userId'],
                  equals: userId,
                },
              },
            ],
          },
          ...(filters.action ? [{ action: filters.action }] : []),
        ],
      };

      // Execute query
      const [activities, totalActivities] = await Promise.all([
        this.prisma.activity.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.activity.count({ where }),
      ]);

      return {
        data: activities,
        meta: {
          total: totalActivities,
          page,
          limit,
          totalPages: Math.ceil(totalActivities / limit),
        },
      };
    } catch (error) {
      this.logger.error(`Lỗi khi lấy nhật ký hoạt động: ${error.message}`);
      throw error;
    }
  }

  /**
   * Lấy lịch sử sử dụng phòng của người dùng
   * @param userId ID người dùng
   * @param page Trang
   * @param limit Số lượng mỗi trang
   * @param dateRange Khoảng thời gian
   */
  async getUserRoomUsage(
    userId: number,
    page = 1,
    limit = 10,
    dateRange?: { startDate?: Date; endDate?: Date },
  ) {
    const skip = (page - 1) * limit;

    try {
      // Xây dựng điều kiện truy vấn
      const where = {
        userId,
        ...(dateRange?.startDate && {
          startTime: { gte: dateRange.startDate },
        }),
        ...(dateRange?.endDate && {
          endTime: { lte: dateRange.endDate },
        }),
      };

      // Thực hiện truy vấn
      const [roomUsages, totalRoomUsages] = await Promise.all([
        this.prisma.roomUsage.findMany({
          where,
          include: {
            room: true,
            schedule: true, // Thêm thông tin lịch (nếu có)
            computerUsages: {
              include: {
                computer: true,
              },
            },
          },
          orderBy: { startTime: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.roomUsage.count({ where }),
      ]);

      // Ghi log hoạt động
      await this.logActivity(userId, 'ROOM_USAGE_HISTORY_VIEWED', {
        count: roomUsages.length,
        dateRange,
      });

      return {
        data: roomUsages,
        meta: {
          total: totalRoomUsages,
          page,
          limit,
          totalPages: Math.ceil(totalRoomUsages / limit),
        },
      };
    } catch (error) {
      this.logger.error(`Lỗi khi lấy lịch sử sử dụng phòng: ${error.message}`);
      throw error;
    }
  }

  /**
   * Lấy lịch sử sử dụng phòng trong khoảng thời gian
   * @param startDate Ngày bắt đầu
   * @param endDate Ngày kết thúc
   * @param page Trang
   * @param limit Số lượng mỗi trang
   */
  async getRoomUsageStatistics(
    startDate: Date,
    endDate: Date,
    page = 1,
    limit = 10,
  ) {
    const skip = (page - 1) * limit;

    try {
      const where = {
        startTime: { gte: startDate },
        ...(endDate && { endTime: { lte: endDate } }),
      };

      const [roomUsages, totalRoomUsages] = await Promise.all([
        this.prisma.roomUsage.findMany({
          where,
          include: {
            room: true,
            user: true,
            computerUsages: {
              include: {
                computer: true,
              },
            },
          },
          orderBy: { startTime: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.roomUsage.count({ where }),
      ]);

      // Tính toán thống kê
      const totalUsageTime = roomUsages.reduce((total, usage) => {
        if (!usage.endTime) return total;
        return total + (usage.endTime.getTime() - usage.startTime.getTime());
      }, 0);

      const averageUsageTime =
        roomUsages.length > 0 ? totalUsageTime / roomUsages.length : 0;

      return {
        data: roomUsages,
        meta: {
          total: totalRoomUsages,
          page,
          limit,
          totalPages: Math.ceil(totalRoomUsages / limit),
        },
        statistics: {
          totalUsageCount: totalRoomUsages,
          totalUsageTimeMs: totalUsageTime,
          averageUsageTimeMs: averageUsageTime,
          startDate,
          endDate,
        },
      };
    } catch (error) {
      this.logger.error(`Lỗi khi lấy thống kê sử dụng phòng: ${error.message}`);
      throw error;
    }
  }
}
