import { IsOptional, IsString } from 'class-validator';

export class DeleteComputerUsageDto {
  @IsOptional()
  @IsString()
  notes?: string;
}