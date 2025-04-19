import { TransferStatus } from '../../common/enums';

export interface FileTransfer {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  userId: number;
  sourceComputerId?: number;
  status: TransferStatus;
  transferredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface FileTransferTarget {
  id: number;
  fileTransferId: number;
  computerId: number;
  status: TransferStatus;
  transferredAt?: string;
}

export interface FileTransferWithTargets extends FileTransfer {
  targets: FileTransferTarget[];
}

export interface FileTransferFilter {
  userId?: number;
  computerId?: number;
  status?: TransferStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface CreateFileTransferDto {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  userId: number;
  sourceComputerId?: number;
  targetComputerIds: number[];
}

export interface UpdateFileTransferStatusDto {
  transferId: number;
  computerId: number;
  status: TransferStatus;
}