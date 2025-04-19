import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class EndUsageDto {
  @IsNotEmpty({ message: 'Usage ID is required' })
  @IsNumber({}, { message: 'Usage ID must be a number' })
  usageId: number;

  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  notes?: string;
}

// Giữ lại để tương thích ngược (deprecated)
export { EndUsageDto as UpdateRoomUsageDto };