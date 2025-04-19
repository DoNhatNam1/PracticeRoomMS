import { IsNumber, IsOptional, IsString } from 'class-validator';

export class StartComputerUsageDto {
  @IsNumber()
  computerId: number;

  @IsNumber()
  userId: number;

  @IsOptional()
  @IsNumber()
  roomUsageId?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  teacherId?: number; // ID giáo viên cho phân quyền xem hoạt động
}