import Cookies from 'js-cookie';

/**
 * Service quản lý token authentication sử dụng cookies
 */
class TokenService {
  private readonly ACCESS_TOKEN_KEY = 'accessToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  
  // Tính toán thời gian hết hạn từ JWT token
  private getExpirationFromToken(token: string): number {
    try {
      // Decode JWT payload (phần 2 của JWT token sau khi split theo dấu .)
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload && payload.exp) {
        // Quy đổi thành số ngày (JWT exp là timestamp tính bằng giây)
        const expiresInMs = payload.exp * 1000 - Date.now();
        return expiresInMs > 0 ? expiresInMs / (1000 * 60 * 60 * 24) : 1/48; // Default 30 phút nếu đã hết hạn
      }
    } catch (e) {
      console.error('Error parsing token:', e);
    }
    return 1/48; // Default 30 phút nếu không parse được
  }

  // Lưu access token vào cookie
  setAccessToken(token: string): void {
    const expDays = this.getExpirationFromToken(token);
    Cookies.set(this.ACCESS_TOKEN_KEY, token, {
      expires: expDays, // Tính từ JWT
      secure: process.env.NODE_ENV === 'production', // HTTPS trong production
      sameSite: 'strict' // Chống CSRF
    });
  }

  // Lấy access token từ cookie
  getAccessToken(): string | null {
    return Cookies.get(this.ACCESS_TOKEN_KEY) || null;
  }

  // Lưu refresh token
  setRefreshToken(token: string): void {
    const expDays = this.getExpirationFromToken(token);
    // Tăng thời hạn để đảm bảo refresh token sống lâu hơn access token
    const refreshExpDays = Math.max(expDays, 7); // Tối thiểu 7 ngày

    Cookies.set(this.REFRESH_TOKEN_KEY, token, {
      expires: refreshExpDays,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
  }

  // Lấy refresh token
  getRefreshToken(): string | null {
    return Cookies.get(this.REFRESH_TOKEN_KEY) || null;
  }

  // Xóa tất cả token
  clearTokens(): void {
    Cookies.remove(this.ACCESS_TOKEN_KEY);
    Cookies.remove(this.REFRESH_TOKEN_KEY);
  }
  
  // Kiểm tra accessToken có hết hạn không
  isAccessTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch (e) {
      return true;
    }
  }
}

export const tokenService = new TokenService();