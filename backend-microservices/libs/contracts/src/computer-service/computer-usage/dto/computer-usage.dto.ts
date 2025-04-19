import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class ComputerUsageDto {
  @IsNumber()
  id: number;
  
  @IsNumber()
  computerId: number;
  
  @IsNumber()
  roomUsageId: number;
  
  @IsDateString()
  startTime: string;
  
  @IsOptional()
  @IsDateString()
  endTime?: string;
  
  @IsOptional()
  @IsString()
  notes?: string;
  
  createdAt: string;
  updatedAt: string;
  
  @IsOptional()
  computer?: {
    id: number;
    name: string;
    status: string;
  };
  
  @IsOptional()
  roomUsage?: {
    id: number;
    roomId: number;
    userId: number;
    startTime: string;
    endTime?: string;
  };
}

export class ComputerUsageFilterDto {
  @IsOptional()
  @IsNumber()
  computerId?: number;
  
  @IsOptional()
  @IsNumber()
  roomUsageId?: number;
  
  @IsOptional()
  @IsNumber()
  userId?: number;
  
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