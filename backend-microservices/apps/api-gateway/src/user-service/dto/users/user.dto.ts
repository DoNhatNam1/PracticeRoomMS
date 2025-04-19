import { Role } from '@prisma/client';

export class UserDto {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  department?: string;
  role: Role;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}