import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { USER_SERVICE_CLIENT } from '../constant';
import { USER_PATTERNS } from '@app/contracts/user-service/users/constants';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(@Inject(USER_SERVICE_CLIENT) private usersClient: ClientProxy) {}

  async findAll(params: {
    page: number;
    limit: number;
    filters?: {
      role?: string;
      department?: string;
      search?: string;
    };
    currentUser: any;
  }) {
    this.logger.log(`Gửi yêu cầu lấy danh sách người dùng với params: ${JSON.stringify(params)}`);
    return firstValueFrom(
      this.usersClient.send(USER_PATTERNS.FIND_ALL, params)
    );
  }

  async findOne(id: number, currentUser: any) {
    this.logger.log(`Gửi yêu cầu lấy thông tin người dùng id: ${id}`);
    return firstValueFrom(
      this.usersClient.send(USER_PATTERNS.FIND_ONE, { id, currentUser })
    );
  }

  async create(createUserDto: any, currentUser?: any) {
    try {
      // Hash password trước khi gửi đến microservice
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      
      // Đảm bảo gửi đúng cấu trúc dữ liệu mà user-service mong đợi
      // Đừng bọc trong object payload, gửi createUserData trực tiếp
      const createUserData = {
        email: createUserDto.email,
        password: hashedPassword,
        name: createUserDto.name,
        role: createUserDto.role,
        department: createUserDto.department,
        createdById: currentUser?.sub
      };
      
      this.logger.log(`Creating user with email: ${createUserDto.email}`);
      
      // Đảm bảo currentUser là tham số thứ 2, không nằm trong payload
      return firstValueFrom(
        this.usersClient.send(USER_PATTERNS.CREATE, createUserData)
      );
    } catch (error) {
      this.logger.error(`Error creating user: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: number, updateUserDto: any, currentUser?: any) {
    this.logger.log(`Gửi yêu cầu cập nhật người dùng id: ${id}, người gửi: ${currentUser?.sub || 'Unknown'}`);
    return firstValueFrom(
      this.usersClient.send(USER_PATTERNS.UPDATE, {
        id,
        updateUserDto,
        currentUser
      })
    );
  }

  async remove(id: number, currentUser?: any) {
    this.logger.log(`Gửi yêu cầu xóa người dùng id: ${id}, người gửi: ${currentUser?.sub || 'Unknown'}`);
    return firstValueFrom(
      this.usersClient.send(USER_PATTERNS.REMOVE, { 
        id, 
        currentUser
      })
    );
  }

  async updateRole(
    id: number, 
    updateRoleDto: { role: string },
    currentUser: any
  ) {
    this.logger.debug(`Sending role update with currentUser: ${JSON.stringify(currentUser)}`);
    this.logger.log(`Gửi yêu cầu cập nhật vai trò người dùng ID: ${id} thành ${updateRoleDto.role}`);
    
    return firstValueFrom(
      this.usersClient.send(USER_PATTERNS.UPDATE_ROLE, {
        id,
        updateRoleDto,
        currentUser
      })
    );
  }

  async updateStatus(
    id: number, 
    updateStatusDto: { isActive: boolean },
    currentUser: any
  ) {
    this.logger.log(`Gửi yêu cầu cập nhật trạng thái người dùng id: ${id} -> isActive: ${updateStatusDto.isActive}`);
    return firstValueFrom(
      this.usersClient.send(USER_PATTERNS.UPDATE_STATUS, {
        id,
        isActive: updateStatusDto.isActive,
        currentUser
      })
    );
  }

  async getUserActivity(
    userId: number,
    page = 1,
    limit = 10,
    filters?: {
      action?: string;
    },
    currentUser?: any
  ) {
    this.logger.log(`Gửi yêu cầu lấy lịch sử hoạt động của người dùng ID: ${userId}`);
    
    return firstValueFrom(
      this.usersClient.send(USER_PATTERNS.GET_USER_ACTIVITY, {
        userId,
        page,
        limit,
        filters,
        currentUser
      })
    );
  }

  async getUserRoomUsage(
    userId: number,
    page = 1,
    limit = 10,
    dateRange?: {
      startDate?: Date;
      endDate?: Date;
    },
    currentUser?: any
  ) {
    this.logger.log(`Gửi yêu cầu lấy lịch sử sử dụng phòng của người dùng ID: ${userId}`);
    
    return firstValueFrom(
      this.usersClient.send(USER_PATTERNS.GET_USER_ROOM_USAGE, {
        userId,
        page,
        limit,
        dateRange,
        currentUser
      })
    );
  }

  async getStudentsByTeacher(teacherId: number, options: { page: number; limit: number; search?: string }) {
    this.logger.log(`Getting students for teacher ${teacherId}`);
    return firstValueFrom(
      this.usersClient.send(USER_PATTERNS.GET_STUDENTS_BY_TEACHER, {
        teacherId,
        ...options
      })
    );
  }
}