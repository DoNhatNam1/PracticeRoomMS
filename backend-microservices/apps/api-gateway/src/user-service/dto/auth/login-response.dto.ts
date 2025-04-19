import { User } from "@prisma/client";


export class LoginResponseDto {
  /**
   * Token truy cập JWT
   */
  accessToken: string;

  /**
   * Token làm mới (tùy chọn)
   */
  refreshToken?: string;

  /**
   * Thông tin người dùng đã đăng nhập
   */
  user: User;

  /**
   * Thời gian hết hạn của token (tính bằng giây)
   */
  expiresIn?: number;

  /**
   * Loại token, mặc định là "Bearer"
   */
  tokenType?: string = 'Bearer';
}