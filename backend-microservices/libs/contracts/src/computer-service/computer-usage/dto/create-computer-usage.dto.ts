import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateComputerUsageDto {
  @IsNotEmpty()
  @IsNumber()
  computerId: number;
  
  @IsOptional()
  @IsString()
  notes?: string;
}