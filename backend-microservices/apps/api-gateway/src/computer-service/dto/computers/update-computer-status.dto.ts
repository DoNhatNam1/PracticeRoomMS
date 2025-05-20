import { IsEnum, IsNotEmpty } from 'class-validator';

export enum ComputerStatus {
  OPERATIONAL = 'OPERATIONAL',
  MAINTENANCE = 'MAINTENANCE',
  IN_USE = 'IN_USE',
  OFFLINE = 'OFFLINE',
  OUT_OF_ORDER = 'OUT_OF_ORDER'
}

export class UpdateComputerStatusDto {
  @IsNotEmpty()
  @IsEnum(ComputerStatus, {
    message: 'Status must be one of: OPERATIONAL, MAINTENANCE, IN_USE, OFFLINE, OUT_OF_ORDER'
  })
  status: ComputerStatus;
}