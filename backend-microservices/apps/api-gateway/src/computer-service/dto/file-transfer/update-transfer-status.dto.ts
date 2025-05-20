import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export enum FileTransferStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REJECTED = 'REJECTED'
}

export class UpdateTransferStatusDto {
  @IsEnum(FileTransferStatus)
  status: FileTransferStatus;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  targetComputerId?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}