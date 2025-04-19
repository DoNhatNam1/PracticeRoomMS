import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class StartUsageDto {
  @IsNotEmpty({ message: 'Computer ID is required' })
  @IsNumber({}, { message: 'Computer ID must be a number' })
  computerId: number;
  
  @IsNotEmpty({ message: 'Room usage ID is required' })
  @IsNumber({}, { message: 'Room usage ID must be a number' })
  roomUsageId: number;
  
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  notes?: string;
}