import apiClient from './base';
import { ApiResponse } from '../types/common/response';
import { PaginatedResponse } from '../types/common/pagination';
import { LogType } from '../types/common/enums';

interface SystemLogFilter {
  type?: LogType;
  userId?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

interface SystemStatus {
  version: string;
  uptime: number;
  serverTime: string;
  services: {
    database: boolean;
    cache: boolean;
    fileStorage: boolean;
  };
  memoryUsage: {
    total: number;
    used: number;
    free: number;
  };
  cpuUsage: number;
}

interface SystemStats {
  activeUsers: number;
  totalRooms: number;
  totalComputers: number;
  activeComputers: number;
  schedulesForToday: number;
  maintenanceItems: number;
}

export const getSystemLogs = async (params: SystemLogFilter = {}): Promise<ApiResponse<PaginatedResponse<any>>> => {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<any>>>('/system/logs', { params });
  return response.data;
};

export const getSystemStatus = async (): Promise<ApiResponse<SystemStatus>> => {
  const response = await apiClient.get<ApiResponse<SystemStatus>>('/system/status');
  return response.data;
};

export const getSystemStats = async (): Promise<ApiResponse<SystemStats>> => {
  const response = await apiClient.get<ApiResponse<SystemStats>>('/system/stats');
  return response.data;
};