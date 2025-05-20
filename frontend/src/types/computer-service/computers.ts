import { User } from '../user-service/users';
import { Room } from '../room-service/rooms';

export enum ComputerStatus {
  OPERATIONAL = "OPERATIONAL",
  IN_USE = "IN_USE",
  MAINTENANCE = "MAINTENANCE",
  OUT_OF_ORDER = "OUT_OF_ORDER",
  OFFLINE = "OFFLINE",
  RESERVED = "RESERVED"
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

export interface Computer {
  id: number;
  name: string;
  ipAddress?: string;
  macAddress?: string;
  specs?: ComputerSpecs;
  roomId: number;
  status: ComputerStatus;
  createdAt?: string;
  updatedAt?: string;
  room?: Room;
  usages?: ComputerUsage[];
}

export interface ComputerUsage {
  id: number;
  computerId: number;
  notes?: string;
  roomUsageId: number;
  startTime: string;
  endTime?: string;
  createdAt?: string;
  updatedAt?: string;
  computer?: Computer;
  roomUsage?: RoomUsage;
  user?: User;
}

export interface RoomUsage {
  id: number;
  roomId: number;
  userId: number;
  startTime: string;
  endTime: string;
  purpose?: string;
  createdAt?: string;
  updatedAt?: string;
  scheduleId?: number | null;
  user?: User;
}

export enum FileTransferStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  REJECTED = "REJECTED",
  FAILED = "FAILED"
}

export interface FileTransfer {
  id: number;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  path: string;
  sourceId: number;
  transferredAt: string;
  status: FileTransferStatus;
  userId: number;
  createdAt: string;
  updatedAt: string;
  user?: User;
  targets?: FileTransferTarget[];
}

export interface FileTransferTarget {
  id: number;
  fileTransferId: number;
  computerId: number;
  status: FileTransferStatus;
  computer?: Computer;
}

export interface ComputerActivity {
  id: number;
  action: string;
  details: {
    service: string;
    entityId: number;
    entityType: string;
    timestamp: string;
    computerId: number;
    [key: string]: any;
  };
  createdAt: string;
  actorId: number | null;
  visibleToId: number | null;
  actor: {
    id: number;
    name: string;
    email: string;
    role: string;
  } | null;
}

// DTOs
export interface CreateComputerDto {
  name: string;
  roomId: number;
  ipAddress?: string;
  macAddress?: string;
  status?: ComputerStatus;
  specs?: ComputerSpecs;
}

export interface UpdateComputerDto {
  name?: string;
  ipAddress?: string;
  macAddress?: string;
  specs?: ComputerSpecs;
}

export interface UpdateComputerStatusDto {
  status: ComputerStatus;
}

export interface CreateComputerUsageDto {
  computerId: number;
  notes?: string;
}

export interface FileTransferStatusUpdateDto {
  status: FileTransferStatus;
  targetComputerId: number;
  notes?: string;
}