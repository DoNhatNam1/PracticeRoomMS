import { apiRequest } from './base';
import { 
  LoginCredentials, 
  LoginResponse,
  RegisterDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto
} from '../types/user-service/auth';
import { ApiResponse } from '../types/common/response';

export const login = (credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> => {
  return apiRequest<LoginResponse>('POST', '/auth/login', { data: credentials });
};

export const register = (userData: RegisterDto): Promise<ApiResponse<any>> => {
  return apiRequest<any>('POST', '/auth/register', { data: userData });
};

export const logout = (): Promise<ApiResponse<any>> => {
  return apiRequest<any>('POST', '/auth/logout');
};

export const changePassword = (data: ChangePasswordDto): Promise<ApiResponse<any>> => {
  return apiRequest<any>('POST', '/auth/change-password', { data });
};

export const forgotPassword = (data: ForgotPasswordDto): Promise<ApiResponse<any>> => {
  return apiRequest<any>('POST', '/auth/forgot-password', { data });
};

export const resetPassword = (data: ResetPasswordDto): Promise<ApiResponse<any>> => {
  return apiRequest<any>('POST', '/auth/reset-password', { data });
};

export const refreshToken = (refreshToken: string): Promise<ApiResponse<LoginResponse>> => {
  return apiRequest<LoginResponse>('POST', '/auth/refresh', { 
    data: { refreshToken } 
  });
};