export interface ComputerUsage {
  id: number;
  computerId: number;
  userId: number;
  startTime: string;
  endTime?: string;
  roomUsageId?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ComputerUsageFilter {
  computerId?: number;
  userId?: number;
  startDate?: string;
  endDate?: string;
  roomId?: number;
  active?: boolean;
  page?: number;
  limit?: number;
}

export interface StartComputerUsageDto {
  computerId: number;
  userId: number;
  roomUsageId?: number;
  notes?: string;
}

export interface EndComputerUsageDto {
  usageId: number;
  notes?: string;
}

export interface ComputerUsageStats {
  totalUsageHours: number;
  averageSessionLength: number;
  mostActiveUsers: Array<{
    userId: number;
    name: string;
    usageHours: number;
  }>;
  usageByTimeOfDay: Array<{
    hour: number;
    count: number;
  }>;
}