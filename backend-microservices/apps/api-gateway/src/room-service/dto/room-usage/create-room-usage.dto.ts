import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRoomUsageDto {
  @IsNotEmpty({ message: 'Room ID is required' })
  @IsNumber({}, { message: 'Room ID must be a number' })
  roomId: number;

  @IsOptional()
  @IsNumber({}, { message: 'Schedule ID must be a number' })
  scheduleId?: number;

  @IsNotEmpty({ message: 'Start time is required' })
  @IsDateString({}, { message: 'Start time must be a valid date' })
  startTime: string;

  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  notes?: string;
}