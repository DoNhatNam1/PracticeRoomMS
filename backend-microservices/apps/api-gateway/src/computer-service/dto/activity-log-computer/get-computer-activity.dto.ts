import { IsDateString, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { Role } from '@prisma/client';
import { Type } from 'class-transformer';

export class GetComputerActivityDto {
  @IsNumber()
  @Type(() => Number)
  computerId: number;

  @IsNumber()
  @Type(() => Number)
  userId: number;

  @IsEnum(Role)
  role: Role;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}