import { RoomStatus } from '@prisma/client';
import { IsString, IsNumber, IsOptional, IsEnum, IsArray, ArrayNotEmpty } from 'class-validator';


export class CreateRoomDto {
  @IsString()
  name: string;

  @IsNumber()
  @IsOptional()
  capacity?: number;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(RoomStatus, { message: 'Status must be a valid status' })
  @IsOptional()
  status?: RoomStatus = RoomStatus.AVAILABLE;
}
