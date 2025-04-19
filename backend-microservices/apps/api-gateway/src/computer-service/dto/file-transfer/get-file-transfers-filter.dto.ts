import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { TransferStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class GetFileTransfersFilterDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  userId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  sourceId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  targetId?: number;

  @IsOptional()
  @IsEnum(TransferStatus, { each: true })
  status?: TransferStatus[];

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 10;
}