import { 
  Controller, Get, Post, Put, Delete, 
  Body, Param, Query, Request, UseGuards,
  Logger, ParseIntPipe,
  Patch
} from '@nestjs/common';
import { JwtAuthGuard, Public, Roles, RolesGuard } from '@app/contracts/common/auth';
import { RoomsService } from './services/rooms.service';
import { SchedulesService } from './services/schedules.service';
import { RoomUsageService } from './services/room-usage.service';

// DTOs
import { CreateRoomDto, UpdateRoomDto } from './dto/rooms';
import { CheckConflictDto, CreateScheduleDto, UpdateScheduleDto } from './dto';
import { CreateRoomUsageDto } from './dto/room-usage';
import { UpdateRoomStatusDto } from '@app/contracts/room-service';

@Controller('api')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoomServiceController {
  private readonly logger = new Logger(RoomServiceController.name);

  constructor(
    private readonly roomsService: RoomsService,
    private readonly schedulesService: SchedulesService,
    private readonly roomUsageService: RoomUsageService
  ) {}

  //=========================================================================
  // ROOMS ROUTES
  //=========================================================================

  @Get('rooms/dashboard-view')
  @Roles('ADMIN', 'TEACHER')
  async getRoomsDashboardView(
    @Request() req,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('building') building?: string,
    @Query('search') search?: string
  ) {
    this.logger.log(`Request to get rooms for dashboard view from ${req.user.sub}`);
    return this.roomsService.findAllForDashboard({
      page: parseInt(page),
      limit: parseInt(limit),
      filters: { status, type, building, search }
    });
  }

  @Public()
  @Get('rooms/client-view')
  async getRoomsClientView(
    @Query('status') status = 'AVAILABLE',
    @Query('building') building?: string
  ) {
    this.logger.log(`Request to get rooms for client view with status: ${status}`);
    return this.roomsService.findAllForClient({
      filters: { 
        status, 
        building,
        isActive: true // Only show active rooms for clients
      }
    });
  }

  @Get('rooms/:id')
  async findOneRoom(@Param('id', ParseIntPipe) id: number, @Request() req) {
    this.logger.log(`Request to get room ${id} from ${req.user.sub}`);
    return this.roomsService.findOne(id);
  }

  @Public()
  @Get('rooms/:id/public')
  async getPublicRoomDetails(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.findOnePublic(id);
  }

  @Post('rooms')
  @Roles('ADMIN')
  async createRoom(@Body() createRoomDto: CreateRoomDto, @Request() req) {
    this.logger.log(`Request to create room from ${req.user.sub}`);
    return this.roomsService.create(createRoomDto, req.user);
  }

  @Put('rooms/:id')
  @Roles('ADMIN')
  async updateRoom(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoomDto: UpdateRoomDto,
    @Request() req
  ) {
    this.logger.log(`Request to update room ${id} from ${req.user.sub}`);
    return this.roomsService.update(id, updateRoomDto, req.user);
  }

  @Delete('rooms/:id')
  @Roles('ADMIN')
  async removeRoom(@Param('id', ParseIntPipe) id: number, @Request() req) {
    this.logger.log(`Request to delete room ${id} from ${req.user.sub}`);
    return this.roomsService.remove(id, req.user);
  }

  @Patch('rooms/:id/status')
  @Roles('ADMIN', 'TEACHER')
  async updateRoomStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateRoomStatusDto,
    @Request() req
  ) {
    return this.roomsService.updateStatus(id, updateStatusDto, req.user);
  }

  @Get('rooms/:id/activity-history')
  async getRoomActivityHistory(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    this.logger.log(`Request to get activity history for room ${id} from ${req.user.sub}`);
    return this.roomsService.getRoomActivityHistory(id, req.user, {
      page: parseInt(page),
      limit: parseInt(limit),
      startDate,
      endDate
    });
  }

  @Get('rooms/:id/usage-stats')
  @Roles('ADMIN', 'TEACHER')
  async getRoomUsageStats(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    this.logger.log(`Request to get usage stats for room ${id} from ${req.user.sub}`);
    return this.roomsService.getRoomUsageStats(id, { startDate, endDate });
  }

  @Get('rooms/report')
  @Roles('ADMIN', 'TEACHER')
  async getRoomsReport(
    @Request() req,
    @Query('department') department?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    this.logger.log(`Request to get rooms report from ${req.user.sub}`);
    return this.roomsService.getRoomsReport({ department, startDate, endDate }, req.user);
  }

  //=========================================================================
  // SCHEDULES ROUTES
  //=========================================================================

  @Get('schedules')
  async findAllSchedules(
    @Request() req,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('roomId') roomId?: string,
    @Query('userId') userId?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    this.logger.log(`Request to get all schedules from ${req.user.sub}`);
    return this.schedulesService.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      filters: {
        roomId: roomId ? parseInt(roomId) : undefined,
        userId: userId ? parseInt(userId) : undefined,
        status,
        startDate,
        endDate,
      },
      user: req.user
    });
  }

  @Get('schedules/:id')
  async findOneSchedule(@Param('id', ParseIntPipe) id: number, @Request() req) {
    this.logger.log(`Request to get schedule ${id} from ${req.user.sub}`);
    return this.schedulesService.findOne(id, req.user);
  }

  @Post('schedules')
  async createSchedule(@Body() createScheduleDto: CreateScheduleDto, @Request() req) {
    this.logger.log(`Request to create schedule from ${req.user.sub}`);
    return this.schedulesService.create(createScheduleDto, req.user);
  }

  @Put('schedules/:id')
  async updateSchedule(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateScheduleDto: UpdateScheduleDto,
    @Request() req
  ) {
    this.logger.log(`Request to update schedule ${id} from ${req.user.sub}`);
    return this.schedulesService.update(id, updateScheduleDto, req.user);
  }

  @Delete('schedules/:id')
  async cancelSchedule(@Param('id', ParseIntPipe) id: number, @Request() req) {
    this.logger.log(`Request to cancel schedule ${id} from ${req.user.sub}`);
    return this.schedulesService.cancel(id, req.user);
  }

  @Put('schedules/:id/approve')
  @Roles('ADMIN', 'TEACHER')
  async approveSchedule(@Param('id', ParseIntPipe) id: number, @Request() req) {
    this.logger.log(`Request to approve schedule ${id} from ${req.user.sub}`);
    return this.schedulesService.updateStatus(id, 'APPROVED', req.user);
  }

  @Put('schedules/:id/reject')
  @Roles('ADMIN', 'TEACHER')
  async rejectSchedule(@Param('id', ParseIntPipe) id: number, @Request() req) {
    this.logger.log(`Request to reject schedule ${id} from ${req.user.sub}`);
    return this.schedulesService.updateStatus(id, 'REJECTED', req.user);
  }

  @Post('schedules/check-conflicts')
  async checkScheduleConflicts(
    @Body() checkConflictDto: CheckConflictDto,
    @Request() req
  ) {
    this.logger.log(`Request to check schedule conflicts from ${req.user.sub}`);
    return this.schedulesService.checkConflicts(checkConflictDto);
  }

  @Get('rooms/:id/schedules')
  async getRoomSchedules(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    this.logger.log(`Request to get schedules for room ${id} from ${req.user.sub}`);
    return this.schedulesService.getRoomSchedules(id, startDate, endDate);
  }

  @Get('schedules/:id/activity-history')
  async getScheduleActivityHistory(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Query('page') page = '1',
    @Query('limit') limit = '10'
  ) {
    this.logger.log(`Request to get activity history for schedule ${id} from ${req.user.sub}`);
    return this.schedulesService.getActivityHistory(id, req.user, {
      page: parseInt(page),
      limit: parseInt(limit)
    });
  }
  

  //=========================================================================
  // ROOM USAGE ROUTES
  //=========================================================================

  @Get('room-usages')
  @Roles('ADMIN', 'TEACHER')
  async findAllRoomUsages(
    @Request() req,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('roomId') roomId?: string,
    @Query('userId') userId?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    this.logger.log(`Request to get all room usages from ${req.user.sub}`);
    return this.roomUsageService.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      filters: { 
        roomId: roomId ? parseInt(roomId) : undefined,
        userId: userId ? parseInt(userId) : undefined,
        status,
        startDate,
        endDate
      }
    }, req.user);
  }

  @Get('room-usages/:id')
  async findOneRoomUsage(@Param('id', ParseIntPipe) id: number, @Request() req) {
    this.logger.log(`Request to get room usage ${id} from ${req.user.sub}`);
    return this.roomUsageService.findOne(id, req.user);
  }

  @Post('room-usages')
  async startRoomUsage(@Body() createRoomUsageDto: CreateRoomUsageDto, @Request() req) {
    this.logger.log(`Request to start room usage from ${req.user.sub}`);
    return this.roomUsageService.startUsage(createRoomUsageDto, req.user);
  }

  @Put('room-usages/:id/end')
  async endRoomUsage(@Param('id', ParseIntPipe) id: number, @Request() req) {
    this.logger.log(`Request to end room usage ${id} from ${req.user.sub}`);
    return this.roomUsageService.endUsage(id, req.user);
  }

  @Get('rooms/:id/usage-history')
  async getRoomUsageHistory(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    this.logger.log(`Request to get usage history for room ${id} from ${req.user.sub}`);
    return this.roomUsageService.getRoomUsageHistory(id, {
      page: parseInt(page),
      limit: parseInt(limit),
      startDate,
      endDate
    }, req.user);
  }

  @Post('rooms/:id/maintenance')
  @Roles('ADMIN', 'TEACHER')
  async markRoomForMaintenance(
    @Param('id', ParseIntPipe) id: number,
    @Body() maintenanceData: { reason: string; startTime: string; endTime: string },
    @Request() req
  ) {
    this.logger.log(`Request to mark room ${id} for maintenance from ${req.user.sub}`);
    return this.roomUsageService.markRoomForMaintenance(id, maintenanceData, req.user);
  }

  @Get('users/:id/room-activities')
  @Roles('ADMIN', 'TEACHER')
  async getUserRoomActivities(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    this.logger.log(`Request to get room activities for user ${id} from ${req.user.sub}`);
    return this.roomUsageService.getUserRoomActivities(id, {
      page: parseInt(page),
      limit: parseInt(limit),
      startDate,
      endDate
    }, req.user);
  }
}