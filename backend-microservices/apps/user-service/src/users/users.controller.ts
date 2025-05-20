import {
  Controller,
  Logger,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { MessagePattern, EventPattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { ActivityLogUserService } from '../activity-log-user/activity-log-user.service';
import { USERS_PATTERNS } from '@app/contracts/user-service/users/constants';

@Controller()
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly activityLogUserService: ActivityLogUserService,
  ) {}

  @MessagePattern(USERS_PATTERNS.CREATE)
  async create(@Payload() createUserData: any) {
    try {
      this.logger.log(`Received create user request: ${JSON.stringify({...createUserData, password: '[REDACTED]'})}`);
      
      // createUserData được truyền trực tiếp, không cần destructure thêm
      return this.usersService.create(createUserData);
    } catch (error) {
      this.logger.error(`Error creating user: ${error.message}`, error.stack);
      return { error: true, message: error.message };
    }
  }

  @MessagePattern(USERS_PATTERNS.FIND_ALL)
  async findAll(
    @Payload()
    payload: {
      page: number;
      limit: number;
      filters?: {
        role?: string;
        department?: string;
        search?: string;
      };
      currentUser: any;
    },
  ) {
    this.logger.log(
      `Nhận yêu cầu lấy danh sách người dùng với pagination và filters`,
    );

    // Kiểm tra Role từ enum mới
    if (!payload.currentUser) {
      return {
        success: false,
        message: 'Không có quyền truy cập danh sách người dùng',
        statusCode: 403,
      };
    }

    // Truyền toàn bộ payload vào service thay vì truyền từng tham số riêng biệt
    return this.usersService.findAll({
      page: payload.page,
      limit: payload.limit,
      filters: payload.filters,
      currentUser: payload.currentUser,
    });
  }

  @MessagePattern(USERS_PATTERNS.FIND_ONE)
async findOne(@Payload() payload: { id: number; currentUser: any }) {
  const { id, currentUser } = payload;
  
  this.logger.log(`Nhận yêu cầu lấy thông tin người dùng id: ${id}`);
  
  if (!currentUser) {
    return {
      success: false,
      message: 'Không có quyền truy cập thông tin người dùng',
      statusCode: 403
    };
  }
  
  // Truyền cả currentUser
  return this.usersService.findOne(id, currentUser);
}

@MessagePattern(USERS_PATTERNS.REMOVE)
async remove(@Payload() payload: any) {
  const { id, currentUser } = payload;
  
  if (!currentUser || currentUser.role !== 'ADMIN') {
    return {
      success: false,
      message: 'Không có quyền thực hiện hành động này',
      statusCode: 403
    };
  }
  
  this.logger.log(`Xóa người dùng ID: ${id}`);
  // Truyền thêm currentUser
  return this.usersService.remove(id, currentUser);
}

@MessagePattern(USERS_PATTERNS.UPDATE)
async update(@Payload() payload: any) {
  const { id, updateUserDto, currentUser } = payload;
  
  // Kiểm tra quyền
  if (!currentUser) {
    return {
      success: false,
      message: 'Không có quyền cập nhật người dùng',
      statusCode: 403
    };
  }
  
  // Truyền currentUser vào phương thức update
  const result = await this.usersService.update(id, updateUserDto, currentUser);
  
  if (result && result.success) {
    // Fixed parameter order
    await this.activityLogUserService.logActivity(
      currentUser.sub,    // userId
      'UPDATE_USER',      // action
      {                   // details
        targetId: id,
        changes: updateUserDto
      }
    );
  }
  
  return result;
}

  @MessagePattern(USERS_PATTERNS.UPDATE_STATUS)
  async updateStatus(@Payload() payload: { id: number; isActive: boolean; currentUser: any }) {
    const { id, isActive, currentUser } = payload;

    this.logger.log(
      `Nhận yêu cầu cập nhật trạng thái người dùng ID: ${id} -> isActive: ${isActive}`,
    );

    // Kiểm tra quyền ADMIN
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return {
        success: false,
        message: 'Không có quyền thực hiện hành động này',
        statusCode: 403,
      };
    }

    // Đảm bảo người dùng không tự vô hiệu hóa chính mình
    if (id === currentUser.sub && isActive === false) {
      return {
        success: false,
        message: 'Không thể vô hiệu hóa tài khoản của chính bạn',
        statusCode: 400,
      };
    }

    const result = await this.usersService.updateStatus(id, isActive);

    if (result.success) {
      // Fixed parameter order
      await this.activityLogUserService.logActivity(
        currentUser.sub,    // userId
        'UPDATE_STATUS',    // action 
        {                   // details
          targetId: id,
          isActive
        }
      );
    }

    return result;
  }

  @MessagePattern(USERS_PATTERNS.UPDATE_ROLE)
  async updateRole(@Payload() payload: any) {
    const { id, updateRoleDto, currentUser } = payload;

    // Thêm debug logs chi tiết
    this.logger.debug(`Received payload: ${JSON.stringify(payload)}`);
    this.logger.log(
      `Nhận yêu cầu cập nhật vai trò người dùng ID: ${id} thành ${updateRoleDto?.role}`,
    );
    this.logger.log(`Current user info: ${JSON.stringify(currentUser)}`);

    // Kiểm tra payload đầy đủ
    if (!updateRoleDto || !updateRoleDto.role) {
      return {
        success: false,
        message: 'Vai trò không được cung cấp',
        statusCode: 400,
      };
    }

    // Kiểm tra quyền ADMIN - Đảm bảo chuỗi so sánh chính xác
    if (!currentUser || currentUser.role !== 'ADMIN') {
      this.logger.warn(
        `Từ chối yêu cầu: User ${currentUser?.sub} với role ${currentUser?.role} không phải ADMIN`,
      );
      return {
        success: false,
        message:
          'Không có quyền thực hiện hành động này. Chỉ ADMIN mới có quyền thay đổi vai trò.',
        statusCode: 403,
      };
    }

    // Kiểm tra nếu ID là số
    const userId = typeof id === 'string' ? parseInt(id) : id;

    // Không cho phép ADMIN thay đổi role của chính mình
    if (userId === currentUser.sub) {
      return {
        success: false,
        message: 'Không thể thay đổi vai trò của chính bạn',
        statusCode: 400,
      };
    }

    const result = await this.usersService.updateRole(
      userId,
      updateRoleDto.role,
    );

    if (result.success) {
      // Fixed parameter order
      await this.activityLogUserService.logActivity(
        currentUser.sub,    // userId
        'UPDATE_ROLE',      // action
        {                   // details
          targetId: userId,
          newRole: updateRoleDto.role
        }
      );
    }

    return result;
  }

  @MessagePattern(USERS_PATTERNS.GET_USER_ACTIVITY)
  async getUserActivity(@Payload() payload: any) {
    const { userId, page, limit, filters, currentUser } = payload;

    this.logger.log(
      `Nhận yêu cầu lấy lịch sử hoạt động của người dùng ID: ${userId}`,
    );

    // Kiểm tra quyền
    if (!currentUser || !['ADMIN', 'TEACHER'].includes(currentUser.role)) {
      if (currentUser.sub !== userId) {
        return {
          success: false,
          message: 'Không có quyền xem hoạt động của người dùng này',
          statusCode: 403,
        };
      }
    }

    return this.activityLogUserService.getUserActivity(
      userId,
      page,
      limit,
      filters,
    );
  }

  @MessagePattern(USERS_PATTERNS.GET_USER_ROOM_USAGE)
  async getUserRoomUsage(@Payload() payload: any) {
    const { userId, page, limit, dateRange, currentUser } = payload;

    this.logger.log(
      `Nhận yêu cầu lấy lịch sử sử dụng phòng của người dùng ID: ${userId}`,
    );

    // Kiểm tra quyền
    if (!currentUser || !['ADMIN', 'MANAGER'].includes(currentUser.role)) {
      if (currentUser.sub !== userId) {
        return {
          success: false,
          message:
            'Không có quyền xem lịch sử sử dụng phòng của người dùng này',
          statusCode: 403,
        };
      }
    }

    return this.activityLogUserService.getUserRoomUsage(
      userId,
      page,
      limit,
      dateRange,
    );
  }

  @EventPattern(USERS_PATTERNS.LOG_ACTIVITY)
  async logActivity(@Payload() data: any) {
    const { action, details } = data;

    this.logger.log(`Nhận yêu cầu ghi nhật ký: ${action}`);

    // Extract userId from details if available
    const userId = details?.userId || null;
    
    await this.activityLogUserService.logActivity(
      userId,    // userId
      action,    // action
      details    // details
    );
  }

  @MessagePattern(USERS_PATTERNS.GET_STUDENTS_BY_TEACHER)
  async getStudentsByTeacher(@Payload() payload: any) {
    const { teacherId, page = 1, limit = 10, search, currentUser } = payload;

    this.logger.log(
      `Nhận yêu cầu lấy danh sách học sinh của giáo viên ID: ${teacherId}`,
    );

    // Kiểm tra quyền
    if (
      currentUser &&
      currentUser.role === 'TEACHER' &&
      currentUser.sub !== teacherId
    ) {
      throw new UnauthorizedException(
        'Teachers can only view their own students',
      );
    }

    try {
      return await this.usersService.getStudentsByTeacher(
        teacherId,
        page,
        limit,
        search,
      );
    } catch (error) {
      this.logger.error(`Lỗi khi lấy danh sách học sinh: ${error.message}`);
      return {
        error: true,
        message: error.message,
      };
    }
  }
}
