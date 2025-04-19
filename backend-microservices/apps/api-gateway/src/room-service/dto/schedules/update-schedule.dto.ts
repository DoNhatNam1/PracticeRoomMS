import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { RepeatType } from './create-schedule.dto';

export class UpdateScheduleDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  @IsEnum(RepeatType)
  repeat?: RepeatType;
}