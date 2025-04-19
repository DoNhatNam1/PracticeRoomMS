import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, Min, Max } from 'class-validator';

export enum RoomType {
  PRACTICE = 'PRACTICE',
  PERFORMANCE = 'PERFORMANCE',
  RECORDING = 'RECORDING',
  CLASSROOM = 'CLASSROOM'
}

export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  IN_USE = 'IN_USE',
  MAINTENANCE = 'MAINTENANCE',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE'
}

export class CreateRoomDto {
  @IsNotEmpty({ message: 'Room number is required' })
  @IsString({ message: 'Room number must be a string' })
  roomNumber: string;

  @IsNotEmpty({ message: 'Room name is required' })
  @IsString({ message: 'Room name must be a string' })
  name: string;

  @IsNotEmpty({ message: 'Room type is required' })
  @IsEnum(RoomType, { message: 'Invalid room type' })
  type: RoomType;

  @IsNotEmpty({ message: 'Room capacity is required' })
  @IsNumber({}, { message: 'Capacity must be a number' })
  @Min(1, { message: 'Capacity must be at least 1' })
  @Max(100, { message: 'Capacity must not exceed 100' })
  capacity: number;

  @IsNotEmpty({ message: 'Building is required' })
  @IsString({ message: 'Building must be a string' })
  building: string;

  @IsNotEmpty({ message: 'Floor is required' })
  @IsNumber({}, { message: 'Floor must be a number' })
  floor: number;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsOptional()
  @IsEnum(RoomStatus, { message: 'Invalid room status' })
  status?: RoomStatus = RoomStatus.AVAILABLE;

  @IsOptional()
  @IsString({ message: 'Features must be a string' })
  features?: string;
}