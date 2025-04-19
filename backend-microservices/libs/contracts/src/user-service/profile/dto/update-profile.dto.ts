import { IsEmail, IsOptional, IsString, IsUrl, Length, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  /**
   * Họ tên đầy đủ của người dùng
   */
  @IsOptional()
  @IsString()
  @Length(2, 100)
  fullName?: string;

  /**
   * Số điện thoại
   */
  @IsOptional()
  @IsString()
  @MaxLength(15)
  phoneNumber?: string;

  /**
   * URL của ảnh đại diện
   */
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  /**
   * Khoa/ngành học (nếu là sinh viên)
   */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;

  /**
   * Giới thiệu ngắn về người dùng
   */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  /**
   * Địa chỉ
   */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  /**
   * Các tùy chọn hoặc cài đặt của người dùng
   */
  @IsOptional()
  preferences?: Record<string, any>;
}
