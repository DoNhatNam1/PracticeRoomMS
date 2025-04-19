import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class RoomUsageDto {
  @IsNumber()
  id: number;

  @IsNumber()
  roomId: number;

  @IsNumber()
  userId: number;

  @IsOptional()
  @IsNumber()
  scheduleId?: number;

  @IsDateString()
  startTime: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  @IsString()
  purpose?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  createdAt: Date;
  updatedAt: Date;

  @IsOptional()
  room?: {
    id: number;
    name: string;
    location?: string;
  };

  @IsOptional()
  user?: {
    id: number;
    name: string;
    email?: string;
  };

  @IsOptional()
  schedule?: {
    id: number;
    title: string;
  };

  @IsOptional()
  computerUsages?: Array<{
    id: number;
    computerId: number;
    computerName?: string;
    startTime: string;
    endTime?: string;
  }>;
}

export class RoomUsageFilterDto {
  @IsOptional()
  @IsNumber()
  roomId?: number;

  @IsOptional()
  @IsNumber()
  userId?: number;

  @IsOptional()
  @IsNumber()
  scheduleId?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  active?: boolean;

  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  limit?: number = 10;
}