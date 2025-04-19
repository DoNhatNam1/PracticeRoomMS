import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { COMPUTER_SERVICE_CLIENT } from '../constant';
import { 
  GetFileTransfersFilterDto, 
  UpdateTransferStatusDto 
} from '../dto';
import { FILE_TRANSFER_PATTERNS } from '@app/contracts/computer-service';

@Injectable()
export class FileTransferService {
  private readonly logger = new Logger(FileTransferService.name);

  constructor(
    @Inject(COMPUTER_SERVICE_CLIENT) private computerClient: ClientProxy
  ) {}

  async create(data: {
    userId: number;
    file: Express.Multer.File;
    targetComputerIds: number[] | string;
    sourceId?: number;
  }) {
    this.logger.log(`Creating file transfer by user ${data.userId}`);
    
    // Extract file information
    const { originalname, mimetype, size, buffer, filename, path } = data.file;
    
    // Parse target computer IDs if they're provided as a string
    const targetComputerIds = typeof data.targetComputerIds === 'string' 
      ? data.targetComputerIds.split(',').map(id => parseInt(id.trim())) 
      : data.targetComputerIds;
    
    return firstValueFrom(
      this.computerClient.send(FILE_TRANSFER_PATTERNS.CREATE, {
        userId: data.userId,
        sourceId: data.sourceId,
        targetComputerIds,
        file: {
          originalName: originalname,
          mimeType: mimetype,
          size,
          buffer,
          filename: filename || originalname,
          path: path || `uploads/${Date.now()}-${originalname}`
        }
      })
    );
  }

  async findAll(params: GetFileTransfersFilterDto & { userId: number; role: string }) {
    this.logger.log(`Finding all file transfers with params: ${JSON.stringify(params)}`);
    return firstValueFrom(
      this.computerClient.send(FILE_TRANSFER_PATTERNS.FIND_ALL, params)
    );
  }

  async findOne(id: number, user: any) {
    this.logger.log(`Finding file transfer with id: ${id}`);
    return firstValueFrom(
      this.computerClient.send(FILE_TRANSFER_PATTERNS.FIND_ONE, {
        id,
        userId: user.sub,
        role: user.role
      })
    );
  }

  async updateStatus(
    id: number, 
    updateStatusDto: UpdateTransferStatusDto,
    user: any
  ) {
    this.logger.log(`Updating status of file transfer ${id}: ${JSON.stringify(updateStatusDto)}`);
    return firstValueFrom(
      this.computerClient.send(FILE_TRANSFER_PATTERNS.UPDATE_STATUS, {
        id,
        userId: user.sub,
        ...updateStatusDto
      })
    );
  }
}