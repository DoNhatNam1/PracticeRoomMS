import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from '@app/contracts/room-service/rooms/dto/create-room.dto';
import { ROOMS_PATTERNS } from '@app/contracts/room-service';
import { UpdateRoomStatusDto } from '@app/contracts/room-service';

@Controller()
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @MessagePattern(ROOMS_PATTERNS.CREATE)
  create(data: CreateRoomDto & { _metadata: any }) {
    // Tách metadata
    const { _metadata, ...createRoomDto } = data;
    
    // Thiết lập ngữ cảnh
    this.roomsService.setContext(_metadata);
    
    return this.roomsService.create(createRoomDto);
  }

  @MessagePattern(ROOMS_PATTERNS.FIND_ALL)
  findAll(data: any) {
    // Tách metadata
    const { _metadata, ...query } = data;
    
    // Thiết lập ngữ cảnh
    this.roomsService.setContext(_metadata);
    
    return this.roomsService.findAll(query);
  }

  @MessagePattern(ROOMS_PATTERNS.FIND_ONE)
  findOne(data: any) {
    // Tách metadata
    const { _metadata, id } = data;
    
    // Thiết lập ngữ cảnh
    this.roomsService.setContext(_metadata);
    
    return this.roomsService.findOne(id);
  }

  @MessagePattern(ROOMS_PATTERNS.UPDATE)
  update(data: any) {
    // Tách metadata
    const { _metadata, id, ...updateRoomDto } = data;
    
    // Thiết lập ngữ cảnh
    this.roomsService.setContext(_metadata);
    
    return this.roomsService.update(id, updateRoomDto);
  }

  @MessagePattern(ROOMS_PATTERNS.REMOVE)
  remove(data: any) {
    // Tách metadata
    const { _metadata, id } = data;
    
    // Thiết lập ngữ cảnh
    this.roomsService.setContext(_metadata);
    
    return this.roomsService.remove(id);
  }

  @MessagePattern(ROOMS_PATTERNS.UPDATE_STATUS)
  async updateStatus(@Payload() data: any) {
    const { _metadata, id, ...updateStatusDto } = data;
    
    this.roomsService.setContext(_metadata);
    
    return this.roomsService.updateStatus(id, updateStatusDto);
  }
}

