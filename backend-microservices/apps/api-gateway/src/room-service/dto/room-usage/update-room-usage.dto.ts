import { IsOptional, IsString } from 'class-validator';

export class UpdateRoomUsageDto {
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  notes?: string;
}