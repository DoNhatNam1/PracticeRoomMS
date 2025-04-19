import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@app/prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class ActivityLogRoomService {
  private readonly logger = new Logger(ActivityLogRoomService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Ghi log hoạt động với hỗ trợ phân quyền xem
   * @param userId ID người thực hiện hành động
   * @param action Loại hành động (vd: ROOM_SCHEDULED, ROOM_UPDATED)
   * @param details Chi tiết bổ sung của hành động
   * @param visibleToId ID của người dùng được quyền xem activity này (ngoài admin)
   */
  async logActivity(
    userId: number,
    action: string,
    details: any,
    visibleToId: number | null = null
  ) {
    try {
      // Loại bỏ trường ipAddress không tồn tại trong schema
      const activityData: any = {
        action,
        details,  // details đã chứa entityType, entityId và các thông tin khác
        createdAt: new Date(),
      };

      // Thay đổi từ 'user' thành 'actor'
      if (userId) {
        activityData.actor = {
          connect: { id: userId }
        };
      }

      // Thêm visibleTo relation nếu visibleToId được cung cấp
      if (visibleToId) {
        activityData.visibleTo = {
          connect: { id: visibleToId }
        };
      }

      return this.prisma.activity.create({
        data: activityData
      });
    } catch (error) {
      this.logger.error(`Error creating activity log: ${error.message}`);
      throw error;
    }
  }

  /**
   * Lấy lịch sử hoạt động của một phòng
   * @param roomId ID của phòng cần lấy lịch sử
   * @param currentUser Thông tin người dùng hiện tại để kiểm tra quyền
   * @param options Tùy chọn phân trang và lọc theo thời gian
   */
  async getRoomActivityHistory(
    roomId: number, 
    currentUser: { id: number, role: Role },
    options?: { 
      page?: number; 
      limit?: number;
      startDate?: Date;
      endDate?: Date;
    }
  ) {
    const { page = 1, limit = 10, startDate, endDate } = options || {};
    const skip = (page - 1) * limit;
    
    // Tạo điều kiện tìm kiếm dựa trên roomId trong details
    const roomFilter = {
      details: {
        path: ['roomId'],
        equals: roomId
      }
    };
    
    // Điều kiện lọc theo thời gian
    const timeFilter = {};
    if (startDate || endDate) {
      timeFilter['createdAt'] = {};
      if (startDate) timeFilter['createdAt']['gte'] = startDate;
      if (endDate) timeFilter['createdAt']['lte'] = endDate;
    }
    
    // Điều kiện phân quyền xem dựa trên vai trò người dùng
    const permissionFilter = this.getPermissionFilter(currentUser);
    
    // Kết hợp tất cả điều kiện
    const whereCondition = {
      ...roomFilter,
      ...timeFilter,
      ...permissionFilter
    };
    
    // Truy vấn dữ liệu và đếm tổng
    const [activities, total] = await Promise.all([
      this.prisma.activity.findMany({
        where: whereCondition,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          actor: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      }),
      this.prisma.activity.count({ where: whereCondition })
    ]);
    
    return {
      data: activities,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lấy lịch sử hoạt động của một lịch phòng
   */
  async getScheduleActivityHistory(
    scheduleId: number,
    currentUser: { id: number, role: Role },
    options?: { 
      page?: number; 
      limit?: number;
    }
  ) {
    const { page = 1, limit = 10 } = options || {};
    const skip = (page - 1) * limit;
    
    // Điều kiện lọc theo scheduleId
    const scheduleFilter = {
      details: {
        path: ['entityType'],
        equals: 'SCHEDULE'
      },
      AND: {
        details: {
          path: ['entityId'],
          equals: scheduleId
        }
      }
    };
    
    // Điều kiện phân quyền xem
    const permissionFilter = this.getPermissionFilter(currentUser);
    
    // Kết hợp điều kiện
    const whereCondition = {
      ...scheduleFilter,
      ...permissionFilter
    };
    
    // Truy vấn dữ liệu và đếm tổng
    const [activities, total] = await Promise.all([
      this.prisma.activity.findMany({
        where: whereCondition,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          actor: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      }),
      this.prisma.activity.count({ where: whereCondition })
    ]);
    
    return {
      data: activities,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Helper để tạo điều kiện phân quyền dựa trên người dùng hiện tại
   */
  private getPermissionFilter(currentUser: { id: number, role: Role }) {
    // Admin có thể xem tất cả hoạt động
    if (currentUser.role === Role.ADMIN) {
      return {};
    }
    
    // Teacher có thể xem hoạt động của họ và hoạt động được chia sẻ với họ
    if (currentUser.role === Role.TEACHER) {
      return {
        OR: [
          { actorId: currentUser.id },             // Hoạt động do họ tạo
          { visibleToId: currentUser.id }          // Hoạt động được chia sẻ với họ
        ]
      };
    }
    
    // Student chỉ xem được hoạt động của họ
    return {
      actorId: currentUser.id
    };
  }

  /**
   * Lấy tất cả hoạt động liên quan đến người dùng
   */
  async getUserActivity(userId: number, currentUser: { id: number, role: Role }, options?: any) {
    const { page = 1, limit = 10 } = options || {};
    const skip = (page - 1) * limit;
    
    // Xác định có quyền xem activity của người dùng này không
    let canView = false;
    
    if (currentUser.role === Role.ADMIN) {
      canView = true;
    } else if (currentUser.id === userId) {
      canView = true;
    } else if (currentUser.role === Role.TEACHER) {
      // Kiểm tra người dùng có phải là sinh viên do teacher này tạo không
      const student = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { createdById: true }
      });
      
      if (student && student.createdById === currentUser.id) {
        canView = true;
      }
    }
    
    if (!canView) {
      return {
        data: [],
        meta: {
          total: 0,
          page,
          limit,
          totalPages: 0
        }
      };
    }
    
    // Tạo điều kiện tìm kiếm
    const whereCondition = {
      OR: [
        { actorId: userId },               // Hoạt động do người dùng tạo
        { visibleToId: userId }            // Hoạt động được chia sẻ với người dùng
      ]
    };
    
    // Truy vấn dữ liệu
    const [activities, total] = await Promise.all([
      this.prisma.activity.findMany({
        where: whereCondition,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          actor: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      }),
      this.prisma.activity.count({ where: whereCondition })
    ]);
    
    return {
      data: activities,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}