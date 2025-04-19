import { IsOptional, IsNumber, IsDateString, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ActivityFilterDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  roomId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
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
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 10;
}