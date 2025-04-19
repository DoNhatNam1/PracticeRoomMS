import { RepeatType, ScheduleStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';


export class ScheduleDto {
  @IsNumber()
  id: number;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  roomId: number;

  @IsNumber()
  createdBy: number;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsEnum(RepeatType)
  repeat: RepeatType;

  @IsEnum(ScheduleStatus)
  status: ScheduleStatus;

  createdAt: Date;
  updatedAt: Date;

  @IsOptional()
  room?: {
    id: number;
    name: string;
    location?: string;
  };

  @IsOptional()
  creator?: {
    id: number;
    name: string;
    email?: string;
  };
}

export class ScheduleFilterDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  roomId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  userId?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(ScheduleStatus, { each: true })
  status?: ScheduleStatus | ScheduleStatus[];

  @IsOptional()
  @IsEnum(RepeatType)
  repeat?: RepeatType;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 10;
}

export class ChangeScheduleStatusDto {
  @IsEnum(ScheduleStatus, { message: 'Status must be a valid schedule status' })
  status: ScheduleStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class ScheduleConflictDto {
  conflictingSchedules: ScheduleDto[];
  hasConflict: boolean;
}

export class CheckScheduleConflictDto {
  @IsNumber()
  roomId: number;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsOptional()
  @IsNumber()
  excludeScheduleId?: number;
}