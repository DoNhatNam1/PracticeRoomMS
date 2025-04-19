import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class ActivityFilterDto {
  @IsOptional()
  @IsNumber()
  computerId?: number;
  
  @IsOptional()
  @IsNumber()
  userId?: number;
  
  @IsOptional()
  @IsString()
  action?: string;
  
  @IsOptional()
  @IsDateString()
  startDate?: string;
  
  @IsOptional()
  @IsDateString()
  endDate?: string;
  
  @IsOptional()
  @IsNumber()
  page?: number = 1;
  
  @IsOptional()
  @IsNumber()
  limit?: number = 10;
}