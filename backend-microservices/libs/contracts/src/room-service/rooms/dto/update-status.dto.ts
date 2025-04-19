import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  IN_USE = 'IN_USE',
  MAINTENANCE = 'MAINTENANCE',
  RESERVED = 'RESERVED',
}

export class UpdateRoomStatusDto {
  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(RoomStatus, { message: 'Invalid room status' })
  status: RoomStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}