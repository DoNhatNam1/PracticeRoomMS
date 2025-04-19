import { Injectable, Logger } from '@nestjs/common';
import { ActivityLogUserService } from '../activity-log-user/activity-log-user.service';
import { PrismaService } from '@app/prisma/prisma.service';
import { UpdateProfileDto } from '@app/contracts/user-service';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogService: ActivityLogUserService
  ) {}

  async getProfile(userId: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,          // Trường name thay cho username/fullName
          phone: true,         // Thêm trường phone
          role: true,
          isActive: true,
          department: true,
          createdById: true,   // Thêm thông tin người tạo
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        return {
          success: false,
          message: 'Người dùng không tồn tại',
          statusCode: 404,
        };
      }

      // Log hoạt động xem profile
      await this.activityLogService.logActivity('VIEW_PROFILE', {
        userId,
        action: 'PROFILE_VIEWED'
      });

      return {
        success: true,
        message: 'Lấy thông tin người dùng thành công',
        statusCode: 200,
        data: user,
      };
    } catch (error) {
      this.logger.error(`Lỗi khi lấy profile: ${error.message}`, error.stack);
      return {
        success: false,
        message: 'Lỗi khi lấy thông tin người dùng: ' + error.message,
        statusCode: 500,
      };
    }
  }

  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
    try {
      // Kiểm tra user tồn tại
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true },
      });

      if (!user) {
        return {
          success: false,
          message: 'Người dùng không tồn tại',
          statusCode: 404,
        };
      }

      // Loại bỏ các trường không được phép cập nhật
      const { email, password, role, isActive, createdById, ...allowedFields } = updateProfileDto as any;

      // Cập nhật profile
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: allowedFields,
        select: {
          id: true,
          email: true,
          name: true,         // Thay đổi username/fullName thành name
          phone: true,        // Thêm phone
          role: true,
          isActive: true,
          department: true,
          createdById: true,  // Thêm thông tin người tạo
          createdAt: true,
          updatedAt: true
        }
      });

      // Ghi log hoạt động với cú pháp mới
      await this.activityLogService.logActivity('UPDATE_PROFILE', {
        userId,
        changes: allowedFields,
        action: 'PROFILE_UPDATED'
      });

      return {
        success: true,
        message: 'Cập nhật thông tin người dùng thành công',
        statusCode: 200,
        data: updatedUser,
      };
    } catch (error) {
      this.logger.error(`Lỗi khi cập nhật profile: ${error.message}`, error.stack);
      return {
        success: false,
        message: 'Lỗi khi cập nhật thông tin người dùng: ' + error.message,
        statusCode: 500,
      };
    }
  }
}