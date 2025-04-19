export class ActivityFilterDto {
  userId?: number;
  action?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  page?: number;
  limit?: number;
  serviceName?: string;
}