import apiClient from './base';
import { 
  User, 
  UserFilter, 
  CreateUserDto, 
  UpdateUserDto,
  StudentsByTeacher
} from '../types/user-service/users';
import { 
  UpdateProfileDto, 
  ProfileStats,
  UserProfile 
} from '../types/user-service/profile';
import { ApiResponse } from '../types/common/response';
import { PaginatedResponse } from '../types/common/pagination';

export const getUsers = async (params: UserFilter = {}): Promise<ApiResponse<PaginatedResponse<User>>> => {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<User>>>('/users', { params });
  return response.data;
};

export const getUser = async (id: number): Promise<ApiResponse<User>> => {
  const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
  return response.data;
};

export const getStudentsByTeacher = async (teacherId: number): Promise<ApiResponse<PaginatedResponse<User>>> => {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<User>>>(`/teachers/${teacherId}/students`);
  return response.data;
};

export const createUser = async (data: CreateUserDto): Promise<ApiResponse<User>> => {
  const response = await apiClient.post<ApiResponse<User>>('/users', data);
  return response.data;
};

export const updateUser = async (id: number, data: UpdateUserDto): Promise<ApiResponse<User>> => {
  const response = await apiClient.patch<ApiResponse<User>>(`/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: number): Promise<ApiResponse<{ success: boolean }>> => {
  const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(`/users/${id}`);
  return response.data;
};

export const getUserProfile = async (userId: number): Promise<ApiResponse<UserProfile>> => {
  const response = await apiClient.get<ApiResponse<UserProfile>>(`/users/${userId}/profile`);
  return response.data;
};

export const updateUserProfile = async (userId: number, data: UpdateProfileDto): Promise<ApiResponse<UserProfile>> => {
  const response = await apiClient.patch<ApiResponse<UserProfile>>(`/users/${userId}/profile`, data);
  return response.data;
};

export const getUserStats = async (userId: number): Promise<ApiResponse<ProfileStats>> => {
  const response = await apiClient.get<ApiResponse<ProfileStats>>(`/users/${userId}/stats`);
  return response.data;
};

export const assignStudentsToTeacher = async (teacherId: number, studentIds: number[]): Promise<ApiResponse<StudentsByTeacher>> => {
  const response = await apiClient.post<ApiResponse<StudentsByTeacher>>(`/teachers/${teacherId}/students`, { studentIds });
  return response.data;
};