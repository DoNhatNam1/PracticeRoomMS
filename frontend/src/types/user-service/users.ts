import { Role } from '../common/enums';

export interface User {
  id: number;
  email: string;
  name: string;
  isActive: boolean;
  role: Role;
  department?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  role: Role;
  department?: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  department?: string;
}