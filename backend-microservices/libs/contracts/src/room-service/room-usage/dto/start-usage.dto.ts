import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class StartUsageDto {
  @IsNotEmpty({ message: 'Room ID is required' })
  @IsNumber({}, { message: 'Room ID must be a number' })
  roomId: number;

  @IsOptional()
  @IsNumber({}, { message: 'Schedule ID must be a number' })
  scheduleId?: number;

  @IsOptional()
  @IsString({ message: 'Purpose must be a string' })
  purpose?: string;

  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  notes?: string;
}

// Giữ lại để tương thích ngược (deprecated)
export { StartUsageDto as CreateRoomUsageDto };