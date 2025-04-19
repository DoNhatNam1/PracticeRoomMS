import { IsOptional, IsString } from 'class-validator';

export class LogoutDto {
  /**
   * Refresh token cần thu hồi
   */
  @IsString()
  refreshToken: string;

  /**
   * ID của thiết bị đăng xuất (tùy chọn)
   */
  @IsOptional()
  @IsString()
  deviceId?: string;

  /**
   * Có đăng xuất khỏi tất cả các thiết bị không
   */
  @IsOptional()
  logoutFromAllDevices?: boolean;
}