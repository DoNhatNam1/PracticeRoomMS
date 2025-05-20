import { Controller, Logger, HttpStatus } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ComputersService } from './computers.service';
import { COMPUTER_PATTERNS } from '@app/contracts/computer-service/computers/constants';

@Controller()
export class ComputersController {
  constructor(private readonly computersService: ComputersService) {}
  private readonly logger = new Logger(ComputersController.name);

  @MessagePattern(COMPUTER_PATTERNS.CREATE_COMPUTER)
  create(data: any) {
    // Tách metadata
    const { _metadata, ...createComputerDto } = data;
    
    // Thiết lập ngữ cảnh
    this.computersService.setContext(_metadata);
    
    // Pass user data from metadata to the service
    return this.computersService.create(createComputerDto, _metadata?.user);
  }

  @MessagePattern(COMPUTER_PATTERNS.FIND_ALL_COMPUTERS)
  async findAll(@Payload() payload: any) {
    const { _metadata, page = 1, limit = 10, status, roomId } = payload;
    
    // Explicitly convert to numbers
    const pageNum = +page;
    const limitNum = +limit;
    
    this.computersService.setContext(_metadata);
    
    return this.computersService.findAll(
      pageNum,
      limitNum,
      { status, roomId },
      _metadata?.user
    );
  }

  @MessagePattern(COMPUTER_PATTERNS.GET_ROOM_COMPUTERS_CLIENT)
  async getRoomComputersForClientController(@Payload() payload: any) {
    try {
      const { roomId, status } = payload;
      
      this.logger.log(`Finding computers for client view in room: ${roomId}, status: ${status || 'OPERATIONAL'}`);
      
      // Early validation of roomId at controller level
      if (!roomId) {
        this.logger.warn('Client view request missing required roomId parameter');
        return {
          success: false,
          message: 'Room ID is required to view computers',
          statusCode: 400
        };
      }
      
      // Call service with validated parameters
      return this.computersService.getRoomComputersForClient({ 
        roomId: +roomId, // Ensure it's a number
        status 
      });
    } catch (error) {
      this.logger.error(`Error in findAllClient: ${error.message}`);
      return {
        success: false,
        message: 'Failed to retrieve computers',
        error: error.message
      };
    }
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
    
    // Pass user data from metadata to the service
    return this.computersService.update(id, updateComputerDto, _metadata?.user);
  }

  @MessagePattern(COMPUTER_PATTERNS.REMOVE_COMPUTER)
  remove(data: any) {
    // Tách metadata
    const { _metadata, id } = data;
    
    // Thiết lập ngữ cảnh
    this.computersService.setContext(_metadata);
    
    // Pass user data from metadata to the service
    return this.computersService.remove(id, _metadata?.user);
  }

  @MessagePattern(COMPUTER_PATTERNS.FIND_BY_ROOM)
  findByRoom(data: any) {
    // Tách metadata
    const { _metadata, roomId, page = 1, limit = 10 } = data;
    
    // Thiết lập ngữ cảnh
    this.computersService.setContext(_metadata);
    
    // Pass all required arguments to findAll
    return this.computersService.findAll(
      page,                // Pagination page
      limit,               // Pagination limit
      { roomId },          // Filter by roomId
      _metadata?.user      // Current user from metadata
    );
  }

  @MessagePattern(COMPUTER_PATTERNS.UPDATE_STATUS)
  async updateStatus(@Payload() data: any) {
    try {
      const { _metadata, id, status } = data;
      
      // Log user information for debugging
      this.logger.log(`User data from metadata: ${JSON.stringify(_metadata?.user || 'No user data')}`);
      
      // Set context for tracking
      this.computersService.setContext(_metadata);
      
      this.logger.log(`Updating computer ${id} status to ${status}`);
      
      return this.computersService.updateStatus(id, status, _metadata?.user);
    } catch (error) {
      this.logger.error(`Error updating computer status: ${error.message}`);
      return {
        success: false,
        message: 'Failed to update computer status',
        error: error.message,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      };
    }
  }

}
