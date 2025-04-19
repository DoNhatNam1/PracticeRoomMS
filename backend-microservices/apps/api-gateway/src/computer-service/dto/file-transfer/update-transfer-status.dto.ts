import { IsEnum, IsNumber } from 'class-validator';
import { TransferStatus } from '@prisma/client';

export class UpdateTransferStatusDto {
  @IsNumber()
  fileTransferId: number;

  @IsNumber()
  computerId: number;

  @IsEnum(TransferStatus)
  status: TransferStatus;
}