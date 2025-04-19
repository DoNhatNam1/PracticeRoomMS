import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { RepeatType } from '@prisma/client'; // Sử dụng từ Prisma

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

export { RepeatType };