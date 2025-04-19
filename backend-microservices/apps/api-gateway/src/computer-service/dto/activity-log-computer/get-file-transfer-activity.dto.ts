import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { Role } from '@prisma/client';
import { Type } from 'class-transformer';

export class GetFileTransferActivityDto {
  @IsNumber()
  @Type(() => Number)
  fileTransferId: number;

  @IsNumber()
  @Type(() => Number)
  userId: number;

  @IsEnum(Role)
  role: Role;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 10;
}