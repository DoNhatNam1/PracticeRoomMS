import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateComputerUsageDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  computerId: number;
  
  @IsOptional()
  @IsString()
  notes?: string;
}