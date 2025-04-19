export class UserActivityDto {
  action: string;
  details: any;
  serviceName?: string;
  timestamp?: Date;
}

export class CreateActivityDto {
  action: string;
  details: any;
  userId?: number;
  entityType?: string;
  entityId?: number;
  serviceName?: string;
}

export class GetUserActivityDto {
  userId: number;
  page?: number;
  limit?: number;
  action?: string;
  currentUserId?: number;
  role?: string;
}