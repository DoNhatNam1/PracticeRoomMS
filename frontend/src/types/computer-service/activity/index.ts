import { ComputerStatus } from '../../common/enums';

export interface ComputerActivity {
  id: number;
  computerId: number;
  userId?: number;
  action: string;
  timestamp: string;
  details?: string;
  previousStatus?: ComputerStatus;
  newStatus?: ComputerStatus;
  createdAt: string;
}

export interface ComputerActivityFilter {
  computerId?: number;
  userId?: number;
  action?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface CreateActivityDto {
  computerId: number;
  userId?: number;
  action: string;
  details?: string;
  previousStatus?: ComputerStatus;
  newStatus?: ComputerStatus;
}