import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class EndUsageDto {
  @IsNotEmpty({ message: 'Computer usage ID is required' })
  @IsNumber({}, { message: 'Computer usage ID must be a number' })
  computerUsageId: number;
  
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  notes?: string;
}