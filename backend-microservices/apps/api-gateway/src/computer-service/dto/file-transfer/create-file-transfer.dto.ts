import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFileTransferDto {
  // This will be populated from the file upload
  file: Express.Multer.File;

  @IsArray()
  @Type(() => Number)
  targetComputerIds: number[];

  @IsNumber()
  @Type(() => Number)
  sourceId: number;

  @IsOptional()
  @IsString()
  notes?: string;
}