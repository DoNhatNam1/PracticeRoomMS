import { ComputerStatus, RoomStatus } from '../common/enums';
import { User } from '../user-service/users';

export interface Room {
  id: number;
  name: string;
  capacity: number;
  location?: string;
  description?: string;
  isActive: boolean;
  status: RoomStatus;
  createdAt: string;
  updatedAt: string;
  computers?: Computer[];
  usages?: RoomUsage[];
}

export interface Computer {
  id: number;
  name: string;
  ipAddress?: string;
  macAddress?: string;
  status: ComputerStatus;
  roomId: number;
  specs?: ComputerSpecs;
  createdAt?: string;
  updatedAt?: string;
}

export interface ComputerSpecs {
  os?: string;
  processor?: string;
  ram?: string;
  storage?: string;
  gpu?: string;
  monitor?: string;
  audio?: string;
  software?: string[];
}

export interface RoomUsage {
  id: number;
  roomId: number;
  userId: number;
  startTime: string;
  endTime?: string;
  purpose?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface RoomActivityHistory {
  id: number;
  action: string;
  details: {
    entityId: number;
    entityType: string;
    previousStatus?: string;
    newStatus?: string;
    [key: string]: any;
  };
  createdAt: string;
  actorId: number;
  visibleToId: number | null;
  actor: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export interface RoomMaintenance {
  id: number;
  roomId: number;
  userId: number;
  startTime: string;
  endTime: string;
  purpose: string;
  createdAt: string;
  updatedAt: string;
  scheduleId?: number | null;
}

export interface Schedule {
  id: number;
  roomId: number;
  title: string;
  startTime: string;
  endTime: string;
  repeat: string;
  status: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  room?: {
    id: number;
    name: string;
    location: string | null;
    capacity: number;
    description?: string | null;
    isActive?: boolean;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

// DTOs
export interface CreateRoomDto {
  name: string;
  capacity: number;
  location?: string;
  description?: string;
  status?: RoomStatus;
  equipment?: string[];
}

export interface UpdateRoomDto {
  name?: string;
  capacity?: number;
  location?: string;
  description?: string;
  equipment?: string[];
}

export interface UpdateRoomStatusDto {
  status: RoomStatus;
}

export interface CreateScheduleDto {
  roomId: number;
  title: string;
  startTime: string;
  endTime: string;
  repeat?: string;
}

export interface UpdateScheduleDto {
  title?: string;
  startTime?: string;
  endTime?: string;
  repeat?: string;
}