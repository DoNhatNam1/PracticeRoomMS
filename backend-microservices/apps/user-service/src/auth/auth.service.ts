import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { ActivityLogUserService } from '../activity-log-user/activity-log-user.service';
import { PrismaService } from '@app/prisma/prisma.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly activityLogService: ActivityLogUserService
  ) {}

  /**
   * Mã hóa mật khẩu
   */
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  /**
   * So sánh mật khẩu
   */
  private async comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Đăng ký người dùng mới
   */
  async register(data: any) {
    const { email, password, name, phone, role, department } = data;

    try {
      // Log attempt
      await this.activityLogService.logActivity('REGISTER_ATTEMPT', {
        email,
        name,
        role,
        department
      });

      // Kiểm tra email đã tồn tại chưa
      const existingUser = await this.prisma.user.findFirst({
        where: { email }
      });

      if (existingUser) {
        // Log failure
        await this.activityLogService.logActivity('REGISTER_FAILED', {
          email,
          reason: 'Email already exists'
        });

        return {
          success: false,
          message: 'Email đã tồn tại',
          statusCode: 400
        };
      }

      // Mã hóa mật khẩu
      const hashedPassword = await this.hashPassword(password);

      // Tạo user mới
      const newUser = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          phone,
          role: role || Role.STUDENT,
          department,
          isActive: true
        }
      });

      // Log success
      await this.activityLogService.logActivity('REGISTER_SUCCESS', {
        userId: newUser.id,
        email,
        role: newUser.role
      });

      // Tạo token
      const tokens = this.generateTokens(newUser);

      return {
        success: true,
        message: 'Đăng ký thành công',
        statusCode: 201,
        data: {
          user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role
          },
          ...tokens
        }
      };
    } catch (error) {
      // Log error
      await this.activityLogService.logActivity('REGISTER_ERROR', {
        email,
        error: error.message
      });

      this.logger.error(`Đăng ký thất bại: ${error.message}`, error.stack);
      return {
        success: false,
        message: 'Đăng ký thất bại: ' + error.message,
        statusCode: 500
      };
    }
  }

  /**
   * Đăng nhập
   */
  async login(data: any) {
    const { email, password, rememberMe } = data;

    try {
      // Log attempt
      await this.activityLogService.logActivity('LOGIN_ATTEMPT', {
        email,
        rememberMe
      });

      // Tìm user theo email
      const user = await this.prisma.user.findUnique({ where: { email } });

      // Kiểm tra user tồn tại
      if (!user) {
        // Log login failure
        await this.activityLogService.logActivity('LOGIN_FAILED', {
          email,
          reason: 'User not found'
        });

        return {
          success: false,
          message: 'Email hoặc mật khẩu không đúng',
          statusCode: 401
        };
      }

      // Kiểm tra trạng thái tài khoản
      if (!user.isActive) {
        // Log login blocked
        await this.activityLogService.logActivity('LOGIN_BLOCKED', {
          email,
          userId: user.id,
          reason: 'Account disabled'
        });

        return {
          success: false,
          message: 'Tài khoản đã bị khóa hoặc chưa kích hoạt',
          statusCode: 403
        };
      }

      // So sánh mật khẩu
      const isPasswordValid = await this.comparePasswords(password, user.password);

      if (!isPasswordValid) {
        // Log login wrong password
        await this.activityLogService.logActivity('LOGIN_FAILED', {
          email,
          userId: user.id,
          reason: 'Invalid password'
        });

        return {
          success: false,
          message: 'Email hoặc mật khẩu không đúng',
          statusCode: 401
        };
      }

      // Tạo token
      const tokens = this.generateTokens(user, rememberMe);

      // Cập nhật lần đăng nhập gần nhất
      await this.prisma.user.update({
        where: { id: user.id },
        data: { updatedAt: new Date() }
      });

      // Log login success
      await this.activityLogService.logActivity('LOGIN_SUCCESS', {
        email,
        userId: user.id,
        rememberMe
      });

      return {
        success: true,
        message: 'Đăng nhập thành công',
        statusCode: 200,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          },
          ...tokens
        }
      };
    } catch (error) {
      // Log login error
      await this.activityLogService.logActivity('LOGIN_ERROR', {
        email,
        error: error.message
      });

      this.logger.error(`Đăng nhập thất bại: ${error.message}`, error.stack);
      return {
        success: false,
        message: 'Đăng nhập thất bại: ' + error.message,
        statusCode: 500
      };
    }
  }

  /**
   * Làm mới token
   */
  async refreshToken(data: any) {
    const { refreshToken } = data;

    try {
      // Log attempt
      await this.activityLogService.logActivity('REFRESH_TOKEN_ATTEMPT', {
        tokenHint: refreshToken.substring(0, 10) + '...' // Chỉ log một phần của token
      });

      // Xác thực refresh token
      let payload;
      try {
        payload = this.jwtService.verify(refreshToken, {
          secret: process.env.JWT_REFRESH_SECRET
        });
      } catch (error) {
        // Log failure
        await this.activityLogService.logActivity('REFRESH_TOKEN_FAILED', {
          reason: 'Invalid token',
          error: error.message
        });

        return {
          success: false,
          message: 'Refresh token không hợp lệ hoặc đã hết hạn',
          statusCode: 401
        };
      }

      // Tìm user
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub }
      });

      if (!user) {
        // Log failure
        await this.activityLogService.logActivity('REFRESH_TOKEN_FAILED', {
          userId: payload.sub,
          reason: 'User not found'
        });

        return {
          success: false,
          message: 'User không tồn tại',
          statusCode: 401
        };
      }

      // Tạo tokens mới
      const tokens = this.generateTokens(user, true);

      // Log success
      await this.activityLogService.logActivity('REFRESH_TOKEN_SUCCESS', {
        userId: user.id,
        email: user.email
      });

      return {
        success: true,
        message: 'Token đã được làm mới',
        statusCode: 200,
        data: {
          ...tokens,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        }
      };
    } catch (error) {
      // Log error
      await this.activityLogService.logActivity('REFRESH_TOKEN_ERROR', {
        error: error.message
      });

      this.logger.error(`Refresh token thất bại: ${error.message}`, error.stack);
      return {
        success: false,
        message: 'Refresh token thất bại: ' + error.message,
        statusCode: 500
      };
    }
  }

  /**
   * Đổi mật khẩu
   */
  async changePassword(data: any) {
    const { userId, changePasswordDto } = data;
    const { currentPassword, newPassword, newPasswordConfirm } = changePasswordDto;

    try {
      // Log attempt
      await this.activityLogService.logActivity('CHANGE_PASSWORD_ATTEMPT', {
        userId
      });

      // Kiểm tra mật khẩu mới và xác nhận khớp nhau
      if (newPassword !== newPasswordConfirm) {
        // Log failure
        await this.activityLogService.logActivity('CHANGE_PASSWORD_FAILED', {
          userId,
          reason: 'Passwords do not match'
        });

        return {
          success: false,
          message: 'Mật khẩu mới và xác nhận mật khẩu không khớp',
          statusCode: 400
        };
      }

      // Tìm user
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        // Log failure
        await this.activityLogService.logActivity('CHANGE_PASSWORD_FAILED', {
          userId,
          reason: 'User not found'
        });

        return {
          success: false,
          message: 'User không tồn tại',
          statusCode: 404
        };
      }

      // Kiểm tra mật khẩu hiện tại
      const isCurrentPasswordValid = await this.comparePasswords(currentPassword, user.password);

      if (!isCurrentPasswordValid) {
        // Log failure
        await this.activityLogService.logActivity('CHANGE_PASSWORD_FAILED', {
          userId,
          email: user.email,
          reason: 'Current password incorrect'
        });

        return {
          success: false,
          message: 'Mật khẩu hiện tại không đúng',
          statusCode: 400
        };
      }

      // Mã hóa mật khẩu mới
      const hashedPassword = await this.hashPassword(newPassword);

      // Cập nhật mật khẩu
      await this.prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
      });

      // Log success
      await this.activityLogService.logActivity('CHANGE_PASSWORD_SUCCESS', {
        userId,
        email: user.email
      });

      return {
        success: true,
        message: 'Đổi mật khẩu thành công',
        statusCode: 200
      };
    } catch (error) {
      // Log error
      await this.activityLogService.logActivity('CHANGE_PASSWORD_ERROR', {
        userId,
        error: error.message
      });

      this.logger.error(`Đổi mật khẩu thất bại: ${error.message}`, error.stack);
      return {
        success: false,
        message: 'Đổi mật khẩu thất bại: ' + error.message,
        statusCode: 500
      };
    }
  }

  /**
   * Đăng xuất
   */
  async logout(data: any) {
    const { userId, refreshToken } = data;

    try {
      // Tìm user
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      // Log attempt
      await this.activityLogService.logActivity('LOGOUT_ATTEMPT', {
        userId,
        email: user?.email
      });

      if (!user) {
        // Log failure
        await this.activityLogService.logActivity('LOGOUT_FAILED', {
          userId,
          reason: 'User not found'
        });

        return {
          success: false,
          message: 'User không tồn tại',
          statusCode: 404
        };
      }

      // Nếu có refresh token, xóa nó
      if (refreshToken) {
        try {
          await this.removeToken(refreshToken);
        } catch (err) {
          // Không cần xử lý lỗi này, chỉ log
          this.logger.warn(`Failed to remove token: ${err.message}`);
        }
      }

      // Log success
      await this.activityLogService.logActivity('LOGOUT_SUCCESS', {
        userId,
        email: user.email
      });

      return {
        success: true,
        message: 'Đăng xuất thành công',
        statusCode: 200
      };
    } catch (error) {
      // Log error
      await this.activityLogService.logActivity('LOGOUT_ERROR', {
        userId,
        error: error.message
      });

      this.logger.error(`Đăng xuất thất bại: ${error.message}`, error.stack);
      return {
        success: false,
        message: 'Đăng xuất thất bại: ' + error.message,
        statusCode: 500
      };
    }
  }

  /**
   * Tạo access và refresh token
   */
  private generateTokens(user: any, rememberMe = false) {
    const payload = { 
      sub: user.id, 
      email: user.email,
      name: user.name,
      role: user.role
    };

    const accessToken = this.jwtService.sign(payload);
    
    // Tạo refresh token nếu yêu cầu
    let refreshToken: string | null = null;
    if (rememberMe) {
      refreshToken = this.jwtService.sign(payload, { 
        expiresIn: '7d',
        secret: process.env.JWT_REFRESH_SECRET 
      });
    }

    return { 
      accessToken, 
      refreshToken,
      tokenType: 'Bearer'
    };
  }

  /**
   * Đoạn code xử lý token (trước đây là session)
   */
  async saveToken(userId: number, token: string, expiresAt: Date, type: string = 'REFRESH', deviceInfo?: string) {
    return this.prisma.token.create({
      data: {
        userId,
        token,
        expiresAt,
        deviceInfo,
        type
      }
    });
  }

  async findToken(token: string) {
    return this.prisma.token.findUnique({
      where: { token }
    });
  }

  async removeToken(token: string) {
    return this.prisma.token.delete({
      where: { token }
    });
  }

  async removeUserTokens(userId: number, type?: string) {
    const where: any = { userId };
    if (type) {
      where.type = type;
    }
    
    return this.prisma.token.deleteMany({ where });
  }
}