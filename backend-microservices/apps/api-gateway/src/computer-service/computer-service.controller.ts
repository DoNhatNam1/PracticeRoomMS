import { 
  Controller, Get, Post, Put, Delete, 
  Body, Param, Query, Request, UseGuards,
  Logger, ParseIntPipe, UploadedFile, UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard, Roles, RolesGuard } from '@app/contracts/common/auth';

// Services
import { ComputersService } from './services/computers.service';
import { ComputerUsageService } from './services/computer-usage.service';
import { FileTransferService } from './services/file-transfer.service';
import { ActivityLogComputerService } from './services/activity-log-computer.service';

// DTOs
import { 
  CreateComputerDto, UpdateComputerDto, GetComputersFilterDto,
  StartComputerUsageDto, EndComputerUsageDto, GetComputerUsageDto,
  CreateFileTransferDto, UpdateTransferStatusDto, GetFileTransfersFilterDto,
  GetComputerActivityDto, GetUserComputerActivitiesDto
} from './dto';

@Controller('api')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ComputerServiceController {
  private readonly logger = new Logger(ComputerServiceController.name);

  constructor(
    private readonly computersService: ComputersService,
    private readonly computerUsageService: ComputerUsageService,
    private readonly fileTransferService: FileTransferService,
    private readonly activityLogService: ActivityLogComputerService
  ) {}

  //=========================================================================
  // COMPUTERS ROUTES
  //=========================================================================

  @Get('computers')
  async findAllComputers(
    @Request() req,
    @Query() filterDto: GetComputersFilterDto
  ) {
    this.logger.log(`Request to get all computers from ${req.user.sub}`);
    return this.computersService.findAll(filterDto);
  }

  @Get('computers/:id')
  async findOneComputer(@Param('id', ParseIntPipe) id: number, @Request() req) {
    this.logger.log(`Request to get computer ${id} from ${req.user.sub}`);
    return this.computersService.findOne(id);
  }

  @Post('computers')
  @Roles('ADMIN')
  async createComputer(@Body() createComputerDto: CreateComputerDto, @Request() req) {
    this.logger.log(`Request to create computer from ${req.user.sub}`);
    return this.computersService.create(createComputerDto, req.user);
  }

  @Put('computers/:id')
  @Roles('ADMIN')
  async updateComputer(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateComputerDto: UpdateComputerDto,
    @Request() req
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
    @Body() statusData: { status: string },
    @Request() req
  ) {
    this.logger.log(`Request to update status for computer ${id} from ${req.user.sub}`);
    return this.computersService.updateStatus(id, statusData.status, req.user);
  }

  @Get('computers/:id/activity-history')
  async getComputerActivityHistory(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Query() queryParams: GetComputerActivityDto
  ) {
    this.logger.log(`Request to get activity history for computer ${id} from ${req.user.sub}`);
    return this.activityLogService.getComputerActivityHistory({
      ...queryParams,
      computerId: id,
      userId: req.user.sub,
      role: req.user.role
    });
  }

  @Get('rooms/:id/computers')
  async getRoomComputers(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Query() filterDto: GetComputersFilterDto
  ) {
    this.logger.log(`Request to get computers for room ${id} from ${req.user.sub}`);
    return this.computersService.findByRoom(id, filterDto);
  }

  //=========================================================================
  // COMPUTER USAGE ROUTES
  //=========================================================================

  @Get('computer-usages')
  @Roles('ADMIN', 'TEACHER')
  async findAllComputerUsages(
    @Request() req,
    @Query() filterDto: GetComputerUsageDto
  ) {
    this.logger.log(`Request to get all computer usages from ${req.user.sub}`);
    return this.computerUsageService.findAll({
      ...filterDto,
      role: req.user.role
    });
  }

  @Get('computer-usages/:id')
  async findOneComputerUsage(@Param('id', ParseIntPipe) id: number, @Request() req) {
    this.logger.log(`Request to get computer usage ${id} from ${req.user.sub}`);
    return this.computerUsageService.findOne(id, req.user);
  }

  @Post('computer-usages')
  async startComputerUsage(@Body() startUsageDto: StartComputerUsageDto, @Request() req) {
    this.logger.log(`Request to start computer usage from ${req.user.sub}`);
    return this.computerUsageService.startUsage({
      ...startUsageDto,
      userId: req.user.sub
    });
  }

  @Put('computer-usages/:id/end')
  async endComputerUsage(
    @Param('id', ParseIntPipe) id: number, 
    @Body() endUsageDto: EndComputerUsageDto,
    @Request() req
  ) {
    this.logger.log(`Request to end computer usage ${id} from ${req.user.sub}`);
    return this.computerUsageService.endUsage(id, {
      ...endUsageDto,
      userId: req.user.sub
    });
  }

  @Get('computers/:id/usage-history')
  async getComputerUsageHistory(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Query() filterDto: GetComputerUsageDto
  ) {
    this.logger.log(`Request to get usage history for computer ${id} from ${req.user.sub}`);
    return this.computerUsageService.getComputerUsageHistory(id, {
      ...filterDto,
      userId: req.user.sub,
      role: req.user.role
    });
  }

  @Get('users/:id/computer-usage-stats')
  @Roles('ADMIN', 'TEACHER')
  async getUserComputerUsageStats(
    @Param('id', ParseIntPipe) userId: number,
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    this.logger.log(`Request to get computer usage stats for user ${userId} from ${req.user.sub}`);
    return this.computerUsageService.getUserStats(userId, { startDate, endDate });
  }

  //=========================================================================
  // FILE TRANSFER ROUTES
  //=========================================================================

  @Post('file-transfers')
  @UseInterceptors(FileInterceptor('file'))
  async createFileTransfer(
    @UploadedFile() file: Express.Multer.File,
    @Body() createFileTransferDto: CreateFileTransferDto,
    @Request() req
  ) {
    this.logger.log(`Request to create file transfer from ${req.user.sub}`);
    return this.fileTransferService.create({
      ...createFileTransferDto,
      userId: req.user.sub,
      file: file
    });
  }

  @Get('file-transfers')
  async findAllFileTransfers(
    @Request() req,
    @Query() filterDto: GetFileTransfersFilterDto
  ) {
    this.logger.log(`Request to get all file transfers from ${req.user.sub}`);
    return this.fileTransferService.findAll({
      ...filterDto,
      userId: req.user.sub,
      role: req.user.role
    });
  }

  @Get('file-transfers/:id')
  async findOneFileTransfer(@Param('id', ParseIntPipe) id: number, @Request() req) {
    this.logger.log(`Request to get file transfer ${id} from ${req.user.sub}`);
    return this.fileTransferService.findOne(id, req.user);
  }

  @Put('file-transfers/:id/status')
  async updateFileTransferStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateTransferStatusDto,
    @Request() req
  ) {
    this.logger.log(`Request to update file transfer ${id} status from ${req.user.sub}`);
    return this.fileTransferService.updateStatus(id, updateStatusDto, req.user);
  }

  @Get('file-transfers/:id/activity-history')
  async getFileTransferActivityHistory(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Query('page') page = '1',
    @Query('limit') limit = '10'
  ) {
    this.logger.log(`Request to get activity history for file transfer ${id} from ${req.user.sub}`);
    return this.activityLogService.getFileTransferActivityHistory({
      fileTransferId: id,
      userId: req.user.sub,
      role: req.user.role,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  }

  @Get('users/:id/computer-activities')
  @Roles('ADMIN', 'TEACHER')
  async getUserComputerActivities(
    @Param('id', ParseIntPipe) targetUserId: number,
    @Request() req,
    @Query() queryParams: GetUserComputerActivitiesDto
  ) {
    this.logger.log(`Request to get computer activities for user ${targetUserId} from ${req.user.sub}`);
    return this.activityLogService.getUserComputerActivities({
      ...queryParams,
      targetUserId,
      currentUserId: req.user.sub,
      role: req.user.role
    });
  }
}