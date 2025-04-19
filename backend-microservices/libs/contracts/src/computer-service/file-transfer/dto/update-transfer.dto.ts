import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';

export enum TransferStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export class UpdateTransferDto {
  @IsNotEmpty({ message: 'File transfer ID is required' })
  @IsNumber({}, { message: 'File transfer ID must be a number' })
  fileTransferId: number;
  
  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(TransferStatus, { message: 'Status must be valid' })
  status: TransferStatus;
}