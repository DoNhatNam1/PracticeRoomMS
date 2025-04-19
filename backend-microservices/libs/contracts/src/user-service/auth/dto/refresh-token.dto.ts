import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RefreshTokenDto {
  /**
   * Token làm mới (refresh token)
   */
  @IsNotEmpty()
  @IsString()
  refreshToken: string;

  /**
   * ID của thiết bị (tùy chọn)
   */
  @IsOptional()
  @IsString()
  deviceId?: string;
}