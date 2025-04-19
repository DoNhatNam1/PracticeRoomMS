import { ComputerStatus } from '../../common/enums';

export interface ComputerSpecs {
  cpu?: string;
  ram?: string;
  storage?: string;
  gpu?: string;
  os?: string;
  monitor?: string;
  audioInterfaces?: string[];
  software?: string[];
  peripherals?: string[];
}

export interface Computer {
  id: number;
  name: string;
  ipAddress?: string;
  macAddress?: string;
  roomId: number;
  status: ComputerStatus;
  specs?: ComputerSpecs;
  lastMaintenance?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ComputerWithRoom extends Computer {
  room: {
    id: number;
    name: string;
    location?: string;
  };
}

export interface ComputerFilter {
  roomId?: number;
  status?: ComputerStatus | ComputerStatus[];
  search?: string;
  specs?: Partial<ComputerSpecs>;
  page?: number;
  limit?: number;
}

export interface CreateComputerDto {
  name: string;
  roomId: number;
  ipAddress?: string;
  macAddress?: string;
  status?: ComputerStatus;
  specs?: Partial<ComputerSpecs>;
}

export interface UpdateComputerDto {
  name?: string;
  roomId?: number;
  ipAddress?: string;
  macAddress?: string;
  status?: ComputerStatus;
  specs?: Partial<ComputerSpecs>;
  isActive?: boolean;
}

export interface MaintenanceDto {
  description: string;
  performedBy: number;
  maintenanceDate?: string;
}