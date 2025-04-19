import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { AUTH_PATTERNS } from '@app/contracts/user-service/constants';

@Controller()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @MessagePattern(AUTH_PATTERNS.REGISTER)
  async register(@Payload() data: any) {
    this.logger.log(`Nhận yêu cầu đăng ký tài khoản: ${data.email}`);
    return this.authService.register(data);
  }

  @MessagePattern(AUTH_PATTERNS.LOGIN)
  async login(@Payload() data: any) {
    this.logger.log(`Nhận yêu cầu đăng nhập: ${data.email}`);
    return this.authService.login(data);
  }

  @MessagePattern(AUTH_PATTERNS.REFRESH_TOKEN)
  async refreshToken(@Payload() data: any) {
    this.logger.log('Nhận yêu cầu refresh token');
    return this.authService.refreshToken(data);
  }

  @MessagePattern(AUTH_PATTERNS.CHANGE_PASSWORD)
  async changePassword(@Payload() data: any) {
    this.logger.log(`Nhận yêu cầu đổi mật khẩu cho userId: ${data.userId}`);
    return this.authService.changePassword(data);
  }

  @MessagePattern(AUTH_PATTERNS.LOGOUT)
  async logout(@Payload() data: any) {
    this.logger.log(`Nhận yêu cầu đăng xuất cho userId: ${data.userId}`);
    return this.authService.logout(data);
  }
}