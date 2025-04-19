import { 
  Controller, Get, Post, Put, Delete, Param, Query, Req, Body, 
  UseGuards, Logger, ParseIntPipe, ForbiddenException, ConflictException, InternalServerErrorException,
  Request
} from '@nestjs/common';
import { JwtAuthGuard, Public, Roles, RolesGuard, ResourceOwnerGuard } from '@app/contracts/common/auth';
import { AuthService } from './services/auth.service';
import { UsersService } from './services/users.service';
import { ProfileService } from './services/profile.service';

// DTOs
import { 
  LoginUserDto, RegisterUserDto, RefreshTokenDto, 
  ChangePasswordDto, LogoutDto 
} from './dto/auth/auth.dto';
import { CreateUserDto } from './dto/users/create-user.dto';
import { UpdateUserDto } from './dto/users/update-user.dto';
import { UpdateProfileDto } from './dto/profile/update-profile.dto';
import { UserRole } from './dto/auth/enum/user-role.enum';

@Controller('api')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserServiceController {
  private readonly logger = new Logger(UserServiceController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly profileService: ProfileService
  ) {}

  //=========================================================================
  // AUTH ROUTES
  //=========================================================================

  @Public()
  @Post('auth/register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    this.logger.log(`Nhận yêu cầu đăng ký tài khoản: ${registerUserDto.email}`);
    return this.authService.register(registerUserDto);
  }

  @Public()
  @Post('auth/login')
  async login(@Body() loginDto: LoginUserDto) {
    this.logger.log(`Nhận yêu cầu đăng nhập: ${loginDto.email}`);
    return this.authService.login(loginDto);
  }

  @Put('auth/change-password')
  @UseGuards(ResourceOwnerGuard)
  async changePassword(@Body() changePasswordDto: ChangePasswordDto, @Req() req) {
    return this.authService.changePassword(req.user.sub, changePasswordDto);
  }

  @Public()
  @Post('auth/refresh-token')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('auth/logout')
  async logout(@Body() logoutDto: LogoutDto, @Req() req) {
    return this.authService.logout(req.user.sub, logoutDto);
  }

  //=========================================================================
  // USERS ROUTES
  //=========================================================================

  @Get('users')
  @Roles('ADMIN', 'TEACHER')
  async findAllUsers(
    @Req() req,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('role') role?: string,
    @Query('department') department?: string,
    @Query('search') search?: string
  ) {
    this.logger.log(`Nhận yêu cầu lấy danh sách người dùng từ: ${req.user.sub}`);
    
    // Admin có thể xem tất cả, Teacher chỉ xem được Student do mình tạo
    if (req.user.role === 'TEACHER' && role && role !== 'STUDENT') {
      throw new ForbiddenException('Teachers can only view student accounts');
    }
    
    return this.usersService.findAll({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      filters: { role, department, search },
      currentUser: req.user
    });
  }

  @Get('users/:id')
  @Roles('ADMIN', 'TEACHER')
  async findOneUser(@Param('id', ParseIntPipe) id: number, @Req() req) {
    this.logger.log(`Nhận yêu cầu lấy thông tin người dùng id: ${id}`);
    return this.usersService.findOne(id, req.user);
  }

  @Post('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'TEACHER')
  async createUser(@Body() createUserDto: CreateUserDto, @Request() req) {
    this.logger.log(`Request to create user from ${req.user.sub}`);
    
    try {
      // Truyền thông tin người dùng hiện tại
      return await this.usersService.create(createUserDto, req.user);
    } catch (error) {
      this.logger.error(`Error creating user: ${error.message}`);
      
      // Chuyển đổi các lỗi từ microservice sang HTTP exceptions phù hợp
      if (error.message.includes('Teachers can only create')) {
        throw new ForbiddenException(error.message);
      }
      
      if (error.message.includes('Admin accounts must be created')) {
        throw new ForbiddenException(error.message);
      }
      
      if (error.message.includes('duplicate key')) {
        throw new ConflictException('Email already exists');
      }
      
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  @Put('users/:id')
  @Roles('ADMIN', 'TEACHER')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req
  ) {
    this.logger.log(`Nhận yêu cầu cập nhật người dùng id: ${id}`);
    
    // Kiểm tra phân quyền: TEACHER chỉ có thể cập nhật STUDENT do mình tạo
    if (req.user.role === 'TEACHER' && updateUserDto.role && updateUserDto.role !== 'STUDENT') {
      throw new ForbiddenException('Teachers cannot change role to anything other than STUDENT');
    }
    
    return this.usersService.update(id, updateUserDto, req.user);
  }

  @Delete('users/:id')
  @Roles('ADMIN', 'TEACHER')
  async removeUser(@Param('id', ParseIntPipe) id: number, @Req() req) {
    this.logger.log(`Nhận yêu cầu xóa người dùng id: ${id}`);
    return this.usersService.remove(id, req.user);
  }

  @Put('users/:id/role')
  @Roles('ADMIN')
  async updateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: { role: string },
    @Req() req
  ) {
    this.logger.log(`Nhận yêu cầu cập nhật vai trò người dùng ID: ${id}`);
    return this.usersService.updateRole(id, updateRoleDto, req.user);
  }

  @Put('users/:id/status')
  @Roles('ADMIN', 'TEACHER')
  async updateUserStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: { isActive: boolean },
    @Req() req
  ) {
    this.logger.log(`Nhận yêu cầu cập nhật trạng thái người dùng id: ${id}`);
    return this.usersService.updateStatus(id, updateStatusDto, req.user);
  }

  @Get('users/:id/activity')
  @Roles('ADMIN', 'TEACHER')
  async getUserActivity(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('action') action?: string
  ) {
    this.logger.log(`Nhận yêu cầu lấy lịch sử hoạt động của người dùng ID: ${id}`);
    
    return this.usersService.getUserActivity(
      id, 
      parseInt(page), 
      parseInt(limit),
      { action },
      req.user
    );
  }

  @Get('users/:id/room-usage')
  @Roles('ADMIN', 'TEACHER') 
  async getUserRoomUsage(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    this.logger.log(`Nhận yêu cầu lấy lịch sử sử dụng phòng của người dùng ID: ${id}`);
    
    return this.usersService.getUserRoomUsage(
      id, 
      parseInt(page), 
      parseInt(limit),
      {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined
      },
      req.user
    );
  }
  
  @Get('users/teachers/:id/students')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'TEACHER')
  async getStudentsByTeacher(
    @Param('id', ParseIntPipe) teacherId: number,
    @Request() req,
    @Query() query: any,
  ) {
    this.logger.log(`Request to get students for teacher ${teacherId} from ${req.user.sub}`);
    
    // Check if the current user is the teacher or an admin
    if (req.user.role !== 'ADMIN' && req.user.sub !== teacherId) {
      throw new ForbiddenException('You can only view your own students unless you are an admin');
    }
    
    return this.usersService.getStudentsByTeacher(teacherId, {
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? parseInt(query.limit) : 10,
      search: query.search
    });
  }

  //=========================================================================
  // PROFILE ROUTES
  //=========================================================================

  @Get('profile')
  async getProfile(@Req() req) {
    this.logger.log(`Nhận yêu cầu lấy profile từ userId: ${req.user.sub}`);
    return this.profileService.getProfile(req.user.sub);
  }

  @Put('profile')
  async updateProfile(@Body() updateProfileDto: UpdateProfileDto, @Req() req) {
    this.logger.log(`Nhận yêu cầu cập nhật profile cho userId: ${req.user.sub}`);
    return this.profileService.updateProfile(req.user.sub, updateProfileDto);
  }
}