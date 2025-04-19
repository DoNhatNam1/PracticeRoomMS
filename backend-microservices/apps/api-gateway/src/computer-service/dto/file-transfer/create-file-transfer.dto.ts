import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFileTransferDto {
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

  @IsOptional()
  @IsNumber()
  userId?: number;

  @IsArray()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  targetComputerIds: number[];
}