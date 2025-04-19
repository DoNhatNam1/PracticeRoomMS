import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { USER_SERVICE_CLIENT } from '../constant';
import { AUTH_PATTERNS } from '@app/contracts/user-service/auth/constants';
import { ChangePasswordDto, LoginUserDto, LogoutDto, RefreshTokenDto, RegisterUserDto } from '../dto/auth/auth.dto';
import { LoginResponseDto } from '../dto/auth/login-response.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(USER_SERVICE_CLIENT) private usersClient: ClientProxy
  ) {}

  /**
   * Đăng ký người dùng mới (mặc định là ADMIN)
   */
  async register(registerUserDto: RegisterUserDto) {
    this.logger.log(`Gửi yêu cầu đăng ký người dùng ADMIN: ${registerUserDto.email}`);
    return firstValueFrom(
      this.usersClient.send(AUTH_PATTERNS.REGISTER, {
        ...registerUserDto,
        role: 'ADMIN' // Đảm bảo người dùng đăng ký được gán vai trò ADMIN
      })
    );
  }

  /**
   * Đăng nhập
   */
  async login(loginDto: LoginUserDto): Promise<LoginResponseDto> {
    try {
      this.logger.log(`Gửi yêu cầu đăng nhập cho user: ${loginDto.email}`);
      
      const response = await firstValueFrom(
        this.usersClient.send(AUTH_PATTERNS.LOGIN, loginDto)
      );
      
      if (response.error) {
        throw new UnauthorizedException(response.message || 'Invalid credentials');
      }
      
      return response;
    } catch (error) {
      this.logger.error(`Login failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Refresh token
   */
  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    this.logger.log('Gửi yêu cầu refresh token đến Users Service');
    return firstValueFrom(
      this.usersClient.send(AUTH_PATTERNS.REFRESH_TOKEN, refreshTokenDto)
    );
  }

  /**
   * Đổi mật khẩu
   */
  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    this.logger.log(`Gửi yêu cầu đổi mật khẩu cho userId: ${userId}`);
    return firstValueFrom(
      this.usersClient.send(AUTH_PATTERNS.CHANGE_PASSWORD, { 
        userId, 
        changePasswordDto
      })
    );
  }

  /**
   * Đăng xuất
   */
  async logout(userId: number, logoutDto: LogoutDto) {
    this.logger.log(`Gửi yêu cầu đăng xuất cho userId: ${userId}`);
    return firstValueFrom(
      this.usersClient.send(AUTH_PATTERNS.LOGOUT, { 
        userId, 
        refreshToken: logoutDto.refreshToken
      })
    );
  }
}