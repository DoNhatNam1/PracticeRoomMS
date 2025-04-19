import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTransferDto {
  @IsNotEmpty({ message: 'Filename is required' })
  @IsString({ message: 'Filename must be a string' })
  filename: string;
  
  @IsNotEmpty({ message: 'Original name is required' })
  @IsString({ message: 'Original name must be a string' })
  originalName: string;
  
  @IsNotEmpty({ message: 'Size is required' })
  @IsNumber({}, { message: 'Size must be a number' })
  size: number;
  
  @IsNotEmpty({ message: 'MIME type is required' })
  @IsString({ message: 'MIME type must be a string' })
  mimeType: string;
  
  @IsNotEmpty({ message: 'Path is required' })
  @IsString({ message: 'Path must be a string' })
  path: string;
  
  @IsOptional()
  @IsNumber({}, { message: 'Source ID must be a number' })
  sourceId?: number;
  
  @IsOptional()
  @IsNumber({}, { message: 'User ID must be a number' })
  userId?: number;
  
  @IsArray()
  targetComputerIds: number[];
}