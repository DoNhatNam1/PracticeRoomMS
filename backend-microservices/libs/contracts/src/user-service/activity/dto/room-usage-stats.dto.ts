export class RoomUsageStatsDto {
  startDate: Date | string;
  endDate: Date | string;
  page?: number;
  limit?: number;
}

export class UserRoomUsageDto {
  userId: number;
  page?: number;
  limit?: number;
  startDate?: Date | string;
  endDate?: Date | string;
  currentUserId?: number;
  role?: string;
}

export class RoomUsageStatResponse {
  data: any[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  statistics: {
    totalUsageCount: number;
    totalUsageTimeMs: number;
    averageUsageTimeMs: number;
    startDate: Date;
    endDate: Date;
  };
}