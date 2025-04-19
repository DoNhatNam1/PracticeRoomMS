import { IsEnum, IsIP, IsNumber, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';
import { ComputerStatus } from '@prisma/client';

export class UpdateComputerDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsIP(4)
  ipAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(17)
  macAddress?: string;

  @IsOptional()
  @IsNumber()
  roomId?: number;

  @IsOptional()
  @IsEnum(ComputerStatus)
  status?: ComputerStatus;

  @IsOptional()
  @IsObject()
  specs?: Record<string, any>;
}