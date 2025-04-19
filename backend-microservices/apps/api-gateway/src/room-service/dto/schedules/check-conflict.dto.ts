import { IsDateString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CheckConflictDto {
  @IsNotEmpty({ message: 'Room ID is required' })
  @IsNumber({}, { message: 'Room ID must be a number' })
  roomId: number;

  @IsNotEmpty({ message: 'Start time is required' })
  @IsDateString({}, { message: 'Start time must be a valid date' })
  startTime: string;

  @IsNotEmpty({ message: 'End time is required' })
  @IsDateString({}, { message: 'End time must be a valid date' })
  endTime: string;
  
  @IsOptional()
  @IsNumber({}, { message: 'Exclude schedule ID must be a number' })
  excludeScheduleId?: number;
}