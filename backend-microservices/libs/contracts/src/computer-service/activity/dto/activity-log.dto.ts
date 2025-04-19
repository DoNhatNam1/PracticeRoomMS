import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class ActivityLogDto {
  @IsNotEmpty()
  @IsString()
  action: string;
  
  @IsOptional()
  @IsObject()
  details?: Record<string, any>;
  
  @IsOptional()
  @IsString()
  serviceName?: string = 'computer-service';
}