import { Role } from '../../common/enums';
import { UserProfile } from '../profile';

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  department?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface UserWithProfile extends User {
  profile?: UserProfile;
}

export interface UserFilter {
  search?: string;
  role?: Role | Role[];
  department?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  role: Role;
  department?: string;
  phone?: string;
  isActive?: boolean;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  role?: Role;
  department?: string;
  phone?: string;
  isActive?: boolean;
}

export interface UpdateUserRoleDto {
  role: Role;
  reason?: string;
}

export interface UpdateUserStatusDto {
  isActive: boolean;
  reason?: string;
}

export interface StudentsAssignment {
  teacherId: number;
  studentIds: number[];
}