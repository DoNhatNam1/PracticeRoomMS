import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class ComputerActivityDto {
  @IsNumber()
  id: number;
  
  @IsString()
  action: string;
  
  @IsOptional()
  details?: Record<string, any>;
  
  @IsDateString()
  createdAt: string;
  
  @IsOptional()
  @IsNumber()
  actorId?: number;
  
  @IsOptional()
  actor?: {
    id: number;
    name: string;
    email?: string;
  };
}

export class ComputerActivityStatsDto {
  @IsOptional()
  @IsNumber()
  computerId?: number;
  
  @IsOptional()
  @IsDateString()
  startDate?: string;
  
  @IsOptional()
  @IsDateString()
  endDate?: string;
}