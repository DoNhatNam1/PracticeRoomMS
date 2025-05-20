import { apiRequest } from './base';
import { 
  User, 
  CreateUserDto, 
  UpdateUserDto 
} from '../types/user-service/users';
import { UserActivity } from '../types/user-service/activity'; // Correct import path
import { ApiResponse, PaginatedResponse } from '../types/common/response';

/**
 * Lấy danh sách người dùng với phân trang và bộ lọc
 */
export const getUsers = (params: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
} = {}): Promise<ApiResponse<PaginatedResponse<User>>> => {
  return apiRequest<PaginatedResponse<User>>('GET', '/users', { params });
};

/**
 * Lấy thông tin người dùng theo ID
 */
export const getUserById = (id: number): Promise<ApiResponse<User>> => {
  return apiRequest<User>('GET', `/users/${id}`);
};

/**
 * Tạo người dùng mới
 */
export const createUser = (userData: CreateUserDto): Promise<ApiResponse<User>> => {
  return apiRequest<User>('POST', '/users', { data: userData });
};

/**
 * Cập nhật thông tin người dùng
 */
export const updateUser = (id: number, userData: UpdateUserDto): Promise<ApiResponse<User>> => {
  return apiRequest<User>('PUT', `/users/${id}`, { data: userData });
};

/**
 * Xóa người dùng
 */
export const deleteUser = (id: number): Promise<ApiResponse<{ message: string }>> => {
  return apiRequest<{ message: string }>('DELETE', `/users/${id}`);
};

/**
 * Lấy lịch sử hoạt động của người dùng
 */
export const getUserActivity = (
  id: number, 
  params: { page?: number; limit?: number }
): Promise<ApiResponse<PaginatedResponse<UserActivity>>> => {
  return apiRequest<PaginatedResponse<UserActivity>>('GET', `/users/${id}/activity`, { params });
};

/**
 * Lấy danh sách học sinh của giáo viên
 */
export const getStudentsByTeacher = (
  teacherId: number,
  params: { page?: number; limit?: number; search?: string }
): Promise<ApiResponse<PaginatedResponse<User>>> => {
  return apiRequest<PaginatedResponse<User>>('GET', `/users/teachers/${teacherId}/students`, { params });
};