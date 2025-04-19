import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginUserDto {
  /**
   * Email đăng nhập
   */
  @IsNotEmpty()
  @IsEmail()
  email: string;

  /**
   * Mật khẩu đăng nhập
   */
  @IsNotEmpty()
  @IsString()
  password: string;

  /**
   * Có lưu đăng nhập không
   */
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean = false;

  /**
   * ID của thiết bị (tùy chọn)
   */
  @IsOptional()
  @IsString()
  deviceId?: string;

  /**
   * IP address của client
   */
  @IsOptional()
  @IsString()
  ipAddress?: string;
}