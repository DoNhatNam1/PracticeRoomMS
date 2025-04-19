import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { TransferStatus } from './update-transfer.dto';

export class FileTransferDto {
  @IsNumber()
  id: number;
  
  @IsString()
  filename: string;
  
  @IsString()
  originalName: string;
  
  @IsNumber()
  size: number;
  
  @IsString()
  mimeType: string;
  
  @IsString()
  path: string;
  
  @IsOptional()
  @IsNumber()
  sourceId?: number;
  
  @IsDateString()
  transferredAt: string;
  
  @IsEnum(TransferStatus)
  status: TransferStatus;
  
  @IsOptional()
  @IsNumber()
  userId?: number;
  
  createdAt: string;
  updatedAt: string;
  
  @IsOptional()
  targets?: {
    id: number;
    computerId: number;
    computerName?: string;
    status: TransferStatus;
  }[];
  
  @IsOptional()
  source?: {
    id: number;
    name: string;
  };
  
  @IsOptional()
  user?: {
    id: number;
    name: string;
    email?: string;
  };
}

export class FileTransferFilterDto {
  @IsOptional()
  @IsNumber()
  sourceId?: number;
  
  @IsOptional()
  @IsNumber()
  targetComputerId?: number;
  
  @IsOptional()
  @IsNumber()
  userId?: number;
  
  @IsOptional()
  @IsEnum(TransferStatus)
  status?: TransferStatus;
  
  @IsOptional()
  @IsDateString()
  startDate?: string;
  
  @IsOptional()
  @IsDateString()
  endDate?: string;
  
  @IsOptional()
  @IsString()
  search?: string;
  
  @IsOptional()
  @IsNumber()
  page?: number = 1;
  
  @IsOptional()
  @IsNumber()
  limit?: number = 10;
}