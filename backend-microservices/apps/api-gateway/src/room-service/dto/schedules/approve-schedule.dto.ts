import { ScheduleStatus } from '@prisma/client';
import { IsNotEmpty, IsInt, IsEnum } from 'class-validator';

export class ApproveScheduleDto {
  @IsNotEmpty()
  @IsInt()
  scheduleId: number;
  
  @IsNotEmpty()
  @IsEnum(ScheduleStatus)
  status: ScheduleStatus;
}