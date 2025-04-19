import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ComputersService } from './computers.service';
import { COMPUTER_PATTERNS } from '@app/contracts/computer-service/computers/constants';

@Controller()
export class ComputersController {
  constructor(private readonly computersService: ComputersService) {}

  @MessagePattern(COMPUTER_PATTERNS.CREATE_COMPUTER)
  create(data: any) {
    // Tách metadata
    const { _metadata, ...createComputerDto } = data;
    
    // Thiết lập ngữ cảnh
    this.computersService.setContext(_metadata);
    
    return this.computersService.create(createComputerDto);
  }

  @MessagePattern(COMPUTER_PATTERNS.FIND_ALL_COMPUTERS)
  findAll(data: any) {
    // Tách metadata
    const { _metadata, ...query } = data;
    
    // Thiết lập ngữ cảnh
    this.computersService.setContext(_metadata);
    
    return this.computersService.findAll(query);
  }

  @MessagePattern(COMPUTER_PATTERNS.FIND_ONE_COMPUTER)
  findOne(data: any) {
    // Tách metadata
    const { _metadata, id } = data;
    
    // Thiết lập ngữ cảnh
    this.computersService.setContext(_metadata);
    
    return this.computersService.findOne(id);
  }

  @MessagePattern(COMPUTER_PATTERNS.UPDATE_COMPUTER)
  update(data: any) {
    // Tách metadata
    const { _metadata, id, ...updateComputerDto } = data;
    
    // Thiết lập ngữ cảnh
    this.computersService.setContext(_metadata);
    
    return this.computersService.update(id, updateComputerDto);
  }

  @MessagePattern(COMPUTER_PATTERNS.REMOVE_COMPUTER)
  remove(data: any) {
    // Tách metadata
    const { _metadata, id } = data;
    
    // Thiết lập ngữ cảnh
    this.computersService.setContext(_metadata);
    
    return this.computersService.remove(id);
  }

  @MessagePattern(COMPUTER_PATTERNS.FIND_BY_ROOM)
  findByRoom(data: any) {
    // Tách metadata
    const { _metadata, roomId } = data;
    
    // Thiết lập ngữ cảnh
    this.computersService.setContext(_metadata);
    
    // Có thể gọi findAll với filter theo roomId
    return this.computersService.findAll({ roomId });
  }
}
