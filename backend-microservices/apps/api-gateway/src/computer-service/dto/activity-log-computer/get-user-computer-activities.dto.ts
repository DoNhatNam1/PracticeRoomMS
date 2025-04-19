import { IsArray, IsDateString, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { Role } from '@prisma/client';
import { Type } from 'class-transformer';

export class GetUserComputerActivitiesDto {
  @IsNumber()
  @Type(() => Number)
  targetUserId: number;

  @IsNumber()
  @Type(() => Number)
  currentUserId: number;

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

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  computerIds?: number[];
}