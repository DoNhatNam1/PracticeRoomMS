import { RoomStatus } from '../../common/enums';

export interface Room {
  id: number;
  name: string;
  location?: string;
  capacity: number;
  description?: string;
  features?: string[];
  status: RoomStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoomWithComputers extends Room {
  computers: {
    total: number;
    operational: number;
    inUse: number;
  };
}

export interface RoomFilter {
  search?: string;
  status?: RoomStatus | RoomStatus[];
  location?: string;
  capacity?: number;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateRoomDto {
  name: string;
  location?: string;
  capacity: number;
  description?: string;
  features?: string[];
  status?: RoomStatus;
}

export interface UpdateRoomDto {
  name?: string;
  location?: string;
  capacity?: number;
  description?: string;
  features?: string[];
  status?: RoomStatus;
  isActive?: boolean;
}