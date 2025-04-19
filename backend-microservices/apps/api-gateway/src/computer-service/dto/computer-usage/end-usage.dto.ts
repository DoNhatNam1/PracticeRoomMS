import { IsNumber, IsOptional, IsString } from 'class-validator';

export class EndComputerUsageDto {
  @IsNumber()
  computerId: number;

  @IsNumber()
  userId: number;
  
  @IsOptional()
  @IsNumber()
  usageId?: number;
  
  @IsOptional()
  @IsString()
  notes?: string;
}