import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { COMPUTER_SERVICE_CLIENT } from '../constant';
import { 
  CreateComputerDto, 
  UpdateComputerDto, 
  GetComputersFilterDto 
} from '../dto';
import { COMPUTER_PATTERNS } from '@app/contracts/computer-service/constants';

@Injectable()
export class ComputersService {
  private readonly logger = new Logger(ComputersService.name);

  constructor(
    @Inject(COMPUTER_SERVICE_CLIENT) private computerClient: ClientProxy
  ) {}

  async findAll(filterDto: GetComputersFilterDto) {
    this.logger.log(`Finding all computers with filters: ${JSON.stringify(filterDto)}`);
    return firstValueFrom(
      this.computerClient.send(COMPUTER_PATTERNS.FIND_ALL_COMPUTERS, filterDto)
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
        updatedBy: user.sub
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

  async updateStatus(id: number, status: string, user: any) {
    this.logger.log(`Updating status of computer ${id} to ${status}`);
    return firstValueFrom(
      this.computerClient.send(COMPUTER_PATTERNS.UPDATE_STATUS, {
        id,
        status,
        updatedBy: user.sub
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
}