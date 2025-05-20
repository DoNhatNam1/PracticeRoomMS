import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  Logger,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import {
  JwtAuthGuard,
  Public,
  Roles,
  RolesGuard,
} from '@app/contracts/common/auth';
import * as fs from 'fs';

// Services
import { ComputersService } from './services/computers.service';
import { ComputerUsageService } from './services/computer-usage.service';
import { FileTransferService } from './services/file-transfer.service';
import { ActivityLogComputerService } from './services/activity-log-computer.service';

// DTOs
import {
  CreateComputerDto,
  UpdateComputerDto,
  GetComputersFilterDto,
  CreateComputerUsageDto,
  DeleteComputerUsageDto,
  GetComputerUsageDto,
  CreateFileTransferDto,
  UpdateTransferStatusDto,
  GetFileTransfersFilterDto,
  GetComputerActivityDto,
  GetUserComputerActivitiesDto,
  UpdateComputerStatusDto,
} from './dto';

@Controller('api')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ComputerServiceController {
  private readonly logger = new Logger(ComputerServiceController.name);

  constructor(
    private readonly computersService: ComputersService,
    private readonly computerUsageService: ComputerUsageService,
    private readonly fileTransferService: FileTransferService,
    private readonly activityLogService: ActivityLogComputerService,
  ) {}

  //=========================================================================
  // COMPUTERS ROUTES
  //=========================================================================
  
  @Get('computers/dashboard-view')
  @Roles('ADMIN', 'TEACHER')
  async getComputersDashboardView(
    @Request() req,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('status') status?: string,
    @Query('roomId') roomId?: string,
    @Query('search') search?: string
  ) {
    this.logger.log(`Request to get computers for dashboard view from ${req.user.sub}`);
    
    return this.computersService.findAll({
      page: +page,
      limit: +limit,
      filters: { 
        status, 
        roomId: roomId ? +roomId : undefined,
        search
      },
      user: req.user
    });
  }

  @Public()
  @Get('computers/client-view')
  async getRoomComputersForClientController(
    @Request() req,
    @Query('roomId', new ParseIntPipe({ optional: true })) roomId?: number,
  ) {

    if (!roomId) {
      return {
        success: false,
        message: 'Room ID is required to view computers',
        statusCode: 400
      };
    }
    
    this.logger.log(
      `Fetching all computers for client view in room: ${roomId} (all statuses)`,
    );

    return this.computersService.getRoomComputersForClient({
      roomId,
      user: req.user,
    });
  }

  @Get('computers/:id')
  async findOneComputer(@Param('id', ParseIntPipe) id: number, @Request() req) {
    this.logger.log(`Request to get computer ${id} from ${req.user.sub}`);
    return this.computersService.findOne(id);
  }

  @Post('computers')
  @Roles('ADMIN')
  async createComputer(
    @Body() createComputerDto: CreateComputerDto,
    @Request() req,
  ) {
    this.logger.log(`Request to create computer from ${req.user.sub}`);
    return this.computersService.create(createComputerDto, req.user);
  }

  @Put('computers/:id')
  @Roles('ADMIN')
  async updateComputer(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateComputerDto: UpdateComputerDto,
    @Request() req,
  ) {
    this.logger.log(`Request to update computer ${id} from ${req.user.sub}`);
    return this.computersService.update(id, updateComputerDto, req.user);
  }

  @Delete('computers/:id')
  @Roles('ADMIN')
  async removeComputer(@Param('id', ParseIntPipe) id: number, @Request() req) {
    this.logger.log(`Request to delete computer ${id} from ${req.user.sub}`);
    return this.computersService.remove(id, req.user);
  }

  @Put('computers/:id/status')
  @Roles('ADMIN', 'TEACHER')
  async updateComputerStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() statusDto: UpdateComputerStatusDto,
    @Request() req,
  ) {
    this.logger.log(
      `Request to update status for computer ${id} from ${req.user.sub}`,
    );
    return this.computersService.updateStatus(id, statusDto, req.user);
  }

  @Get('computers/:id/activity-history')
  async getComputerActivityHistory(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    this.logger.log(`Request to get activity history for computer ${id} from ${req.user.sub}`);
    
    // Fix: Pass user as a separate argument
    return this.activityLogService.getComputerActivityHistory(+id, {
      page: +page,
      limit: +limit,
      startDate,
      endDate
    }, req.user);
  }

  @Get('rooms/:id/computers')
  async getRoomComputers(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Query() filterDto: GetComputersFilterDto,
  ) {
    this.logger.log(
      `Request to get computers for room ${id} from ${req.user.sub}`,
    );
    return this.computersService.findByRoom(id, filterDto);
  }

  //=========================================================================
  // COMPUTER USAGE ROUTES
  //=========================================================================

  @Get('computer-usages')
  @Roles('ADMIN', 'TEACHER')
  async findAllComputerUsages(
    @Request() req,
    @Query() filterDto: GetComputerUsageDto,
  ) {
    this.logger.log(`Request to get all computer usages from ${req.user.sub}`);
    return this.computerUsageService.findAll(filterDto, req.user);
  }

  @Get('computer-usages/:id')
  async findOneComputerUsage(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    this.logger.log(`Request to get computer usage ${id} from ${req.user.sub}`);
    return this.computerUsageService.findOne(id, req.user);
  }

  @Post('computer-usages')
  async createComputerUsage(
    @Body() createDto: CreateComputerUsageDto,
    @Request() req,
  ) {
    this.logger.log(`Request to create computer usage from ${req.user.sub}`);
    return this.computerUsageService.create(createDto, req.user);
  }

  @Delete('computer-usages/:id')
  async deleteComputerUsage(
    @Param('id', ParseIntPipe) id: number,
    @Body() deleteDto: DeleteComputerUsageDto,
    @Request() req,
  ) {
    this.logger.log(`Request to delete computer usage ${id} from ${req.user.sub}`);
    return this.computerUsageService.delete(id, deleteDto, req.user);
  }

  @Get('computers/:id/usage-history')
  async getComputerUsageHistory(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    this.logger.log(
      `Request to get usage history for computer ${id} from ${req.user.sub}`,
    );
    return this.computerUsageService.getComputerUsageHistory(id, {
      page: +page,
      limit: +limit,
      startDate,
      endDate
    }, req.user);
  }

  @Get('users/:id/computer-usage-stats')
  @Roles('ADMIN', 'TEACHER')
  async getUserComputerUsageStats(
    @Param('id', ParseIntPipe) userId: number,
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    this.logger.log(
      `Request to get computer usage stats for user ${userId} from ${req.user.sub}`,
    );
    return this.computerUsageService.getUserStats(userId, {
      startDate,
      endDate
    }, req.user);
  }

  //=========================================================================
  // FILE TRANSFER ROUTES
  //=========================================================================

  @Post('file-transfers/send')
  @UseInterceptors(FileInterceptor('file'))
  async createFileTransfer(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @Request() req,
  ) {
    this.logger.log(`Request to create file transfer from ${req.user.sub}`);
    
    // Validate file exists
    if (!file) {
      return {
        success: false,
        message: 'File is required',
        statusCode: 400
      };
    }
    
    // Parse target computer IDs
    const targetComputerIds = body.targetComputerIds 
      ? body.targetComputerIds.split(',').map(id => parseInt(id.trim()))
      : [];
    
    if (targetComputerIds.length === 0) {
      return {
        success: false,
        message: 'At least one target computer is required',
        statusCode: 400
      };
    }
    
    // Parse source computer ID
    const sourceId = parseInt(body.sourceId);
    if (isNaN(sourceId)) {
      return {
        success: false,
        message: 'Valid source ID is required',
        statusCode: 400
      };
    }
    
    const createDto: CreateFileTransferDto = {
      file,
      targetComputerIds,
      sourceId,
      notes: body.notes
    };
    
    return this.fileTransferService.create(createDto, file, req.user);
  }

  @Get('file-transfers/find-all')
  async findAllFileTransfers(
    @Request() req,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('status') status?: string,
    @Query('sourceId') sourceId?: string,
    @Query('targetId') targetId?: string,
  ) {
    this.logger.log(`Request to get all file transfers from ${req.user.sub}`);
    
    return this.fileTransferService.findAll({
      page: +page,
      limit: +limit,
      status,
      sourceId: sourceId ? +sourceId : undefined,
      targetId: targetId ? +targetId : undefined,
    }, req.user);
  }

  @Get('file-transfers/:id')
  async findOneFileTransfer(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    this.logger.log(`Request to get file transfer ${id} from ${req.user.sub}`);
    return this.fileTransferService.findOne(id, req.user);
  }

  @Put('file-transfers/:id/status')
  async updateFileTransferStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateTransferStatusDto,
    @Request() req,
  ) {
    this.logger.log(`Request to update file transfer ${id} status from ${req.user.sub}`);
    return this.fileTransferService.updateStatus(id, updateDto, req.user);
  }

  @Get('computers/:id/file-transfers')
  async getFileTransfersByComputer(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('status') status?: string,
  ) {
    this.logger.log(`Request to get file transfers for computer ${id} from ${req.user.sub}`);
    return this.fileTransferService.getByComputer(id, {
      page: +page,
      limit: +limit,
      status
    }, req.user);
  }
  
  @Get('users/:id/file-transfers')
  @Roles('ADMIN', 'TEACHER')
  async getFileTransfersByUser(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('status') status?: string,
  ) {
    this.logger.log(`Request to get file transfers for user ${id} from ${req.user.sub}`);
    return this.fileTransferService.getByUser(id, {
      page: +page,
      limit: +limit,
      status
    }, req.user);
  }

  @Get('file-transfers/:id/download')
  async downloadFileTransfer(
    @Param('id', ParseIntPipe) id: number,
    @Query('computerId', ParseIntPipe) computerId: number,
    @Request() req,
    @Res() res: Response
  ) {
    this.logger.log(`Request to download file transfer ${id} for computer ${computerId} from ${req.user.sub}`);
    
    const result = await this.fileTransferService.downloadFile(id, computerId, req.user);
    
    if (!result.success) {
      return res.status(result.statusCode || 400).json(result);
    }
    
    // Stream file to response
    const fileStream = fs.createReadStream(result.data.filePath);
    res.setHeader('Content-Disposition', `attachment; filename="${result.data.fileName}"`);
    res.setHeader('Content-Type', result.data.fileType || 'application/octet-stream');
    
    // Pipe the file to response
    fileStream.pipe(res);
    
    // Clean up the temporary file after streaming
    fileStream.on('end', () => {
      try {
        fs.unlinkSync(result.data.filePath);
      } catch (err) {
        this.logger.error(`Error removing temporary file: ${err.message}`);
      }
    });
  }

  @Get('file-transfers/:id/activity-history')
  async getFileTransferActivityHistory(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    this.logger.log(
      `Request to get activity history for file transfer ${id} from ${req.user.sub}`,
    );
    return this.activityLogService.getFileTransferActivityHistory(
      id,
      {
        page: +page,
        limit: +limit,
      }, 
      req.user
    );
  }

  //=========================================================================
  // ACTIVITY LOG ROUTES
  //=========================================================================

  @Get('users/:id/computer-activities')
  @Roles('ADMIN', 'TEACHER')
  async getUserComputerActivities(
    @Param('id', ParseIntPipe) targetUserId: number,
    @Request() req,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('computerIds') computerIds?: string,
  ) {
    this.logger.log(
      `Request to get computer activities for user ${targetUserId} from ${req.user.sub}`,
    );
    
    const parsedComputerIds = computerIds 
      ? computerIds.split(',').map(id => parseInt(id)) 
      : undefined;
    
    return this.activityLogService.getUserComputerActivities(
      targetUserId, 
      {
        page: +page,
        limit: +limit,
        startDate,
        endDate,
        computerIds: parsedComputerIds
      }, 
      req.user
    );
  }
}
