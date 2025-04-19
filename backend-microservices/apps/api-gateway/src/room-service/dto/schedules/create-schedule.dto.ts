import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

// Thêm export để các file khác có thể import
export enum RepeatType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  NONE = 'NONE'
}

export class CreateScheduleDto {
  @IsNumber()
  roomId: number;

  @IsString()
  title: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsOptional()
  @IsEnum(RepeatType)
  repeat?: RepeatType;
}