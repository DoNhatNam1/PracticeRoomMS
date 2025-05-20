import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { COMPUTER_SERVICE_CLIENT } from '../constant';
import { 
  CreateComputerDto, 
  UpdateComputerDto, 
  GetComputersFilterDto, 
  UpdateComputerStatusDto
} from '../dto';
import { COMPUTER_PATTERNS } from '@app/contracts/computer-service/constants';

@Injectable()
export class ComputersService {
  private readonly logger = new Logger(ComputersService.name);

  constructor(
    @Inject(COMPUTER_SERVICE_CLIENT) private computerClient: ClientProxy
  ) {}

  async findAll(params: {
    page: number;
    limit: number;
    filters?: any;
    user: any;
  }) {
    const { page, limit, filters, user } = params;
    
    this.logger.log(`Finding all computers with filters: ${JSON.stringify(filters)}`);
    
    return firstValueFrom(
      this.computerClient.send(COMPUTER_PATTERNS.FIND_ALL_COMPUTERS, {
        page,
        limit,
        ...filters,
        _metadata: { user }
      })
    );
  }

  async findOne(id: number) {
    this.logger.log(`Finding computer with id: ${id}`);
    return firstValueFrom(
      this.computerClient.send(COMPUTER_PATTERNS.FIND_ONE_COMPUTER, { id })
    );
  }

  async create(createComputerDto: CreateComputerDto, user: any) {
    this.logger.log(`Creating new computer: ${JSON.stringify(createComputerDto)}`);
    return firstValueFrom(
      this.computerClient.send(COMPUTER_PATTERNS.CREATE_COMPUTER, {
        ...createComputerDto,
        createdBy: user.sub
      })
    );
  }

  async update(id: number, updateComputerDto: UpdateComputerDto, user: any) {
    this.logger.log(`Updating computer ${id}: ${JSON.stringify(updateComputerDto)}`);
    return firstValueFrom(
      this.computerClient.send(COMPUTER_PATTERNS.UPDATE_COMPUTER, {
        id,
        ...updateComputerDto,
        _metadata: { user }
      })
    );
  }

  async remove(id: number, user: any) {
    this.logger.log(`Removing computer ${id}`);
    return firstValueFrom(
      this.computerClient.send(COMPUTER_PATTERNS.REMOVE_COMPUTER, {
        id,
        deletedBy: user.sub
      })
    );
  }

  async updateStatus(id: number, statusDto: UpdateComputerStatusDto, user: any) {
    return firstValueFrom(
      this.computerClient.send(COMPUTER_PATTERNS.UPDATE_STATUS, {
        id,
        status: statusDto.status,
        _metadata: { user }
      })
    );
  }

  async findByRoom(roomId: number, filterDto: GetComputersFilterDto) {
    this.logger.log(`Finding computers for room ${roomId}`);
    return firstValueFrom(
      this.computerClient.send(COMPUTER_PATTERNS.FIND_BY_ROOM, {
        roomId,
        ...filterDto
      })
    );
  }

  async getRoomComputersForClient(params: {
    roomId: number;
    user?: any;
  }) {
    const { roomId, user } = params;
    
    // Validate roomId is provided
    if (!roomId) {
      this.logger.warn('Client view request missing required roomId parameter');
      return {
        success: false,
        message: 'Room ID is required to view computers',
        statusCode: 400
      };
    }
    
    this.logger.log(`Finding all computers in room ${roomId} for client view (all statuses)`);
    
    return firstValueFrom(
      this.computerClient.send(COMPUTER_PATTERNS.GET_ROOM_COMPUTERS_CLIENT, {
        roomId: +roomId,
        currentUser: user
      })
    );
  }
}