import { PrismaService } from '@app/prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ActivityLogUserService {
  private readonly logger = new Logger(ActivityLogUserService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Ghi nhật ký hoạt động (phiên bản đơn giản)
   * @param action Loại hành động 
   * @param details Chi tiết (có thể chứa bất kỳ thông tin nào trong JSON)
   */
  async logActivity(action: string, ...args: any[]) {
    try {
      // Kiểm tra số lượng tham số để xác định phiên bản nào được gọi
      if (args.length <= 1) {
        // Phiên bản mới (action, details?)
        const details = args[0] || {};
        this.logger.log(`Ghi nhật ký hoạt động (mới): ${action}`);
        
        await this.prisma.activity.create({
          data: {
            action,
            details
          }
        });
      } else {
        // Phiên bản cũ (userId, action, entityType, entityId, additionalInfo?)
        const [userId, entityAction, entityType, entityId, additionalInfo] = args;
        this.logger.log(`Ghi nhật ký hoạt động (cũ): ${entityAction} - ${entityType} #${entityId}`);
        
        // Chuyển đổi sang cấu trúc mới
        const details = {
          userId,
          entityType,
          entityId,
          ...additionalInfo
        };
        
        await this.prisma.activity.create({
          data: {
            action: entityAction,
            details
          }
        });
      }
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Lỗi khi ghi nhật ký hoạt động: ${error.message}`);
      return { 
        success: false, 
        error: error.message 
      };
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
    filters: { action?: string } = {}
  ) {
    const skip = (page - 1) * limit;

    try {
      // Tạo điều kiện truy vấn - tìm kiếm userId trong trường details
      const where = {
        AND: [
          {
            details: {
              path: ['userId'],
              equals: userId
            }
          },
          ...(filters.action ? [{ action: filters.action }] : [])
        ]
      };

      // Thực hiện truy vấn
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
    dateRange?: { startDate?: Date; endDate?: Date }
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
      await this.logActivity('ROOM_USAGE_HISTORY_VIEWED', {
        userId,
        count: roomUsages.length,
        dateRange
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
    limit = 10
  ) {
    const skip = (page - 1) * limit;

    try {
      const where = {
        startTime: { gte: startDate },
        ...(endDate && { endTime: { lte: endDate } })
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

      const averageUsageTime = roomUsages.length > 0 
        ? totalUsageTime / roomUsages.length 
        : 0;

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
          endDate
        }
      };
    } catch (error) {
      this.logger.error(`Lỗi khi lấy thống kê sử dụng phòng: ${error.message}`);
      throw error;
    }
  }
}