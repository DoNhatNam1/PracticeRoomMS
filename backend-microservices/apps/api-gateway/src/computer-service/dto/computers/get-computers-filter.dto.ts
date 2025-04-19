import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ComputerStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class GetComputersFilterDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  roomId?: number;

  @IsOptional()
  @IsEnum(ComputerStatus, { each: true })
  status?: ComputerStatus[];

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 10;
}