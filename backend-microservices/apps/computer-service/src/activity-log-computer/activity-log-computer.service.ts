import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@app/prisma/prisma.service';
import { Role } from '@prisma/client';

// Định nghĩa interface cho options
interface PaginationOptions {
  page?: number;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
}

interface ComputerActivityOptions extends PaginationOptions {
  computerIds?: number[];
}

// Interface cho user context
interface UserContext {
  id: number;
  role: Role;
}

@Injectable()
export class ActivityLogComputerService {
  private readonly logger = new Logger(ActivityLogComputerService.name);
  private context: any = null;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Ghi log hoạt động với phân quyền xem (tương tự room-service)
   * @param actorId ID người thực hiện hành động
   * @param action Loại hành động (vd: COMPUTER_USAGE_STARTED, SOFTWARE_INSTALLED)
   * @param entityType Loại đối tượng (vd: COMPUTER, FILE_TRANSFER)
   * @param entityId ID của đối tượng
   * @param details Chi tiết bổ sung của hành động
   * @param visibleToId ID của người dùng được quyền xem activity này (ngoài admin)
   */
  async logActivity(
    actorId: number,
    action: string,
    entityType: string,
    entityId: number,
    details: Record<string, any>,
    visibleToId: number | null = null
  ) {
    try {
      this.logger.log(`Logging computer activity: ${action} for ${entityType} with ID ${entityId}`);
      
      // Chuẩn bị dữ liệu chi tiết với thêm metadata
      const enhancedDetails = {
        ...details,
        entityType,
        entityId,
        timestamp: new Date(),
        service: 'computer-service'
      };

      // Tạo activity theo schema mới
      await this.prisma.activity.create({
        data: {
          action,
          details: enhancedDetails,
          actorId,
          visibleToId
        }
      });
      
      this.logger.log(`Computer activity logged successfully. Actor: ${actorId}, VisibleTo: ${visibleToId || 'admin only'}`);
    } catch (error) {
      this.logger.error(`Failed to log computer activity: ${error.message}`, error.stack);
      // Không throw exception để không ảnh hưởng đến flow chính
    }
  }

  /**
   * Lấy lịch sử hoạt động của một máy tính
   */
  async getComputerActivityHistory(id: number, options: { 
    page: number; 
    limit: number; 
    startDate?: string; 
    endDate?: string;
  }) {
    try {
      // Ensure id is valid
      if (!id || isNaN(+id)) {
        return {
          success: false,
          message: 'Invalid computer ID',
          statusCode: 400
        };
      }

      const computerId = +id; // Ensure it's a number
      const { page, limit, startDate, endDate } = options;
      
      // Validate computer exists - Fix the undefined ID issue
      const computer = await this.prisma.computer.findUnique({
        where: { id: computerId } // Ensure id is explicitly passed as a number
      });
      
      if (!computer) {
        return {
          success: false,
          message: 'Computer not found',
          statusCode: 404
        };
      }
      
      // Build the where condition - must fix entityType to match your data
      const where: any = {
        OR: [
          { 
            AND: [
              { details: { path: ['entityType'], equals: 'COMPUTER' } },
              { details: { path: ['entityId'], equals: computerId } }
            ]
          },
          {
            AND: [
              { details: { path: ['computerId'], equals: computerId } }
            ]
          }
        ]
      };
      
      // Add date filters if provided
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }
      
      // Calculate pagination
      const skip = (page - 1) * limit;
      
      // Query activities with pagination
      const [activities, total] = await Promise.all([
        this.prisma.activity.findMany({
          where,
          skip,
          take: +limit,
          orderBy: { createdAt: 'desc' },
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
        this.prisma.activity.count({ where })
      ]);
      
      return {
        success: true,
        message: 'Computer activity history retrieved successfully',
        data: {
          activities,
          meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      };
    } catch (error) {
      this.logger.error(`Error retrieving activity for computer ${id}: ${error.message}`);
      return {
        success: false,
        message: 'Failed to retrieve activity history',
        error: error.message
      };
    }
  }
  
  /**
   * Lấy lịch sử hoạt động chuyển file
   */
  async getFileTransferActivityHistory(
    fileTransferId: number,
    currentUser: UserContext,
    options?: PaginationOptions
  ) {
    const { page = 1, limit = 10 } = options || {};
    const skip = (page - 1) * limit;
    
    // Điều kiện lọc theo fileTransferId
    const fileTransferFilter = {
      AND: [
        { details: { path: ['entityType'], equals: 'FILE_TRANSFER' } },
        { details: { path: ['entityId'], equals: fileTransferId } }
      ]
    };
    
    // Điều kiện phân quyền xem
    const permissionFilter = this.getPermissionFilter(currentUser);
    
    // Kết hợp điều kiện
    const whereCondition = {
      ...fileTransferFilter,
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
   * Lấy lịch sử hoạt động của người dùng trên máy tính
   */
  async getUserComputerActivities(
    userId: number,
    currentUser: UserContext,
    options?: ComputerActivityOptions
  ) {
    const { page = 1, limit = 10, startDate, endDate, computerIds } = options || {};
    const skip = (page - 1) * limit;
    
    // Kiểm tra quyền xem activity của người dùng
    const canView = await this.canViewUserActivities(userId, currentUser);
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
    const whereCondition: any = {
      details: {
        path: ['service'],
        equals: 'computer-service'
      },
      actorId: userId
    };
    
    // Thêm điều kiện lọc theo máy tính nếu có
    if (computerIds && computerIds.length > 0) {
      whereCondition.OR = computerIds.map(id => ({
        details: {
          path: ['computerId'],
          equals: id
        }
      }));
    }
    
    // Thêm điều kiện lọc theo thời gian
    if (startDate || endDate) {
      whereCondition.createdAt = {};
      if (startDate) whereCondition.createdAt.gte = startDate;
      if (endDate) whereCondition.createdAt.lte = endDate;
    }
    
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

  /**
   * Helper để kiểm tra xem người dùng hiện tại có quyền xem hoạt động của một người dùng khác không
   */
  private async canViewUserActivities(userId: number, currentUser: UserContext): Promise<boolean> {
    if (currentUser.role === Role.ADMIN) {
      return true;
    }
    
    if (currentUser.id === userId) {
      return true;
    }
    
    if (currentUser.role === Role.TEACHER) {
      // Kiểm tra người dùng có phải là sinh viên do teacher này tạo không
      const student = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { createdById: true }
      });
      
      return student?.createdById === currentUser.id;
    }
    
    return false;
  }

  /**
   * Helper để tạo điều kiện phân quyền dựa trên người dùng hiện tại
   */
  private getPermissionFilter(currentUser: UserContext) {
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
   * Lấy tổng kết thống kê sử dụng máy tính theo người dùng
   */
  async getComputerUsageStatsByUser(userId: number, options?: { startDate?: Date; endDate?: Date }) {
    const { startDate, endDate } = options || {};
    
    // Xây dựng điều kiện thời gian
    const timeFilter: any = {};
    if (startDate || endDate) {
      timeFilter.createdAt = {};
      if (startDate) timeFilter.createdAt.gte = startDate;
      if (endDate) timeFilter.createdAt.lte = endDate;
    }
    
    // Lấy tất cả activity liên quan đến sử dụng máy tính của user
    const activities = await this.prisma.activity.findMany({
      where: {
        actorId: userId,
        action: { 
          in: [
            'COMPUTER_USAGE_STARTED', 
            'COMPUTER_USAGE_ENDED', 
            'LOGIN', 
            'LOGOUT'
          ] 
        },
        details: {
          path: ['service'],
          equals: 'computer-service'
        },
        ...timeFilter
      },
      orderBy: { createdAt: 'asc' }
    });
    
    // Tổng hợp dữ liệu để trả về thống kê
    const usedComputers = new Set<number>();
    const softwareUsed = new Set<number>();
    let totalUsageTime = 0;
    let sessionCount = 0;
    
    // Lưu trữ các phiên đăng nhập đang mở
    const openSessions: Record<string, Date> = {};
    
    // Xử lý dữ liệu theo thời gian
    activities.forEach(activity => {
      const details = activity.details as Record<string, any>;
      const computerId = details.computerId || details.entityId;
      const sessionId = details.sessionId || `${userId}-${computerId}`;
      
      // Đánh dấu máy tính đã sử dụng
      if (computerId) {
        usedComputers.add(computerId);
      }
      
      // Ghi nhận phần mềm đã sử dụng
      if (details.softwareId) {
        softwareUsed.add(details.softwareId);
      }
      
      if (activity.action === 'COMPUTER_USAGE_STARTED' || activity.action === 'LOGIN') {
        // Bắt đầu một phiên mới
        openSessions[sessionId] = new Date(activity.createdAt);
        sessionCount++;
      } 
      else if ((activity.action === 'COMPUTER_USAGE_ENDED' || activity.action === 'LOGOUT') 
               && openSessions[sessionId]) {
        // Kết thúc phiên và tính thời gian
        const startTime = openSessions[sessionId];
        const endTime = new Date(activity.createdAt);
        const sessionDuration = (endTime.getTime() - startTime.getTime()) / 1000; // seconds
        
        totalUsageTime += sessionDuration;
        delete openSessions[sessionId];
      }
    });
    
    // Đối với các phiên chưa đóng, có thể tính đến thời điểm hiện tại
    const now = new Date();
    Object.entries(openSessions).forEach(([sessionId, startTime]) => {
      const sessionDuration = (now.getTime() - startTime.getTime()) / 1000; // seconds
      totalUsageTime += sessionDuration;
    });
    
    // Định dạng kết quả
    return {
      userId,
      stats: {
        usedComputersCount: usedComputers.size,
        usedComputers: Array.from(usedComputers),
        softwareUsedCount: softwareUsed.size,
        softwareUsed: Array.from(softwareUsed),
        sessionCount,
        totalUsageTime, // in seconds
        avgTimePerSession: sessionCount ? totalUsageTime / sessionCount : 0,
        activeSessions: Object.keys(openSessions).length
      },
      period: {
        startDate: startDate || activities[0]?.createdAt,
        endDate: endDate || now
      }
    };
  }

  /**
   * Set context for the service
   */
  setContext(context: any) {
    this.context = context;
    this.logger.log('Activity log service context set');
  }
}