import { IsNumber, IsOptional, IsString } from 'class-validator';

export class LogComputerActivityDto {
  @IsNumber()
  actorId: number;

  @IsString()
  action: string;

  @IsNumber()
  entityId: number;

  @IsString()
  entityType: string;

  @IsOptional()
  @IsNumber()
  visibleToId?: number;
}