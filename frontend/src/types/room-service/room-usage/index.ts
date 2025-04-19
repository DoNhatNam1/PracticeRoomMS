export interface RoomUsage {
  id: number;
  roomId: number;
  userId: number;
  scheduleId?: number;
  startTime: string;
  endTime?: string;
  purpose?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoomUsageWithDetails extends RoomUsage {
  room: {
    id: number;
    name: string;
  };
  user: {
    id: number;
    name: string;
  };
  schedule?: {
    id: number;
    title: string;
  };
}

export interface RoomUsageFilter {
  roomId?: number;
  userId?: number;
  scheduleId?: number;
  startDate?: string;
  endDate?: string;
  active?: boolean;
  page?: number;
  limit?: number;
}

export interface StartRoomUsageDto {
  roomId: number;
  scheduleId?: number;
  purpose?: string;
  notes?: string;
}

export interface EndRoomUsageDto {
  usageId: number;
  notes?: string;
}

export interface RoomUsageStats {
  totalUsageHours: number;
  mostUsedRooms: Array<{
    roomId: number;
    roomName: string;
    usageHours: number;
    usageCount: number;
  }>;
  usageByTimeOfDay: Array<{
    hour: number;
    count: number;
  }>;
  averageSessionLength: number;
}