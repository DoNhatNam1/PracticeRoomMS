import { apiRequest } from './base';
import { LoginCredentials, LoginResponse } from '../types/user-service/auth';
import { ApiResponse } from '../types/common/response';

/**
 * Đăng nhập người dùng
 */
export const login = (credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> => {
  return apiRequest<LoginResponse>('POST', '/auth/login', { data: credentials });
};

/**
 * Đăng xuất người dùng
 */
export const logout = (): Promise<ApiResponse<void>> => {
  return apiRequest<void>('POST', '/auth/logout');
};

/**
 * Refresh token
 */
export const refreshToken = (token: string): Promise<ApiResponse<{ accessToken: string }>> => {
  return apiRequest<{ accessToken: string }>('POST', '/auth/refresh', {
    data: { refreshToken: token }
  });
};