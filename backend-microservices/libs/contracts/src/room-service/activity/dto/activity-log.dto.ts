import { IsNotEmpty, IsOptional, IsString, IsObject, IsDate } from 'class-validator';

export class ActivityLogDto {
  @IsNotEmpty()
  @IsString()
  action: string;

  @IsOptional()
  @IsObject()
  details?: Record<string, any>;

  @IsOptional()
  @IsString()
  serviceName?: string = 'room-service';

  @IsOptional()
  @IsDate()
  timestamp?: Date = new Date();
}

export class CreateActivityLogDto {
  @IsNotEmpty()
  @IsString()
  action: string;

  @IsOptional()
  @IsObject()
  details?: Record<string, any>;

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  userId?: number;

  @IsOptional()
  entityId?: number;
}