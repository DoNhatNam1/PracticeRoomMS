import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { RepeatType } from './create-schedule.dto';

export class UpdateScheduleDto {
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  title?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Start time must be a valid date' })
  startTime?: string;

  @IsOptional()
  @IsDateString({}, { message: 'End time must be a valid date' })
  endTime?: string;

  @IsOptional()
  @IsEnum(RepeatType, { message: 'Invalid repeat type' })
  repeat?: RepeatType;

  @IsOptional()
  @IsString({ message: 'Purpose must be a string' })
  purpose?: string;

  @IsOptional()
  @IsString({ message: 'Additional requirements must be a string' })
  additionalRequirements?: string;
}