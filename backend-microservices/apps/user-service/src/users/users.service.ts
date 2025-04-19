import { PrismaService } from '@app/prisma/prisma.service';
import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { User, Role } from '@prisma/client'; // Sử dụng type trực tiếp từ Prisma

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createUserData: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role?: Role;
    department?: string;
    createdById?: number;
  }) {
    try {
      const { role, createdById } = createUserData;

      // Xử lý phân quyền dựa trên createdById nếu cần
      if (createdById) {
        // Lấy thông tin người tạo
        const creator = await this.prisma.user.findUnique({
          where: { id: createdById },
        });

        if (!creator) {
          throw new ForbiddenException('Creator user not found');
        }

        // Giáo viên chỉ được tạo tài khoản học sinh
        if (creator.role === Role.TEACHER && role !== Role.STUDENT) {
          throw new ForbiddenException(
            'Teachers can only create student accounts',
          );
        }

        // Admin chỉ được tạo tài khoản Teacher hoặc Student
        if (creator.role === Role.ADMIN && role === Role.ADMIN) {
          throw new ForbiddenException(
            'Admin accounts must be created through system registration',
          );
        }

        // Học sinh không được tạo tài khoản khác
        if (creator.role === Role.STUDENT) {
          throw new ForbiddenException('Students cannot create user accounts');
        }

        this.logger.log(
          `User creation authorized by ${creator.role} with ID ${createdById}`,
        );
      }

      // Mặc định role là STUDENT nếu không được chỉ định
      const userRole = role || Role.STUDENT;

      // Tạo người dùng mới
      const newUser = await this.prisma.user.create({
        data: {
          email: createUserData.email,
          password: createUserData.password,
          name: createUserData.name,
          phone: createUserData.phone,
          role: userRole,
          department: createUserData.department,
          createdById,
        },
      });

      // Ghi log hoạt động
      await this.prisma.activity.create({
        data: {
          action: 'USER_CREATED',
          details: {
            userId: newUser.id,
            createdBy: createdById,
            role: newUser.role,
            email: newUser.email,
            name: newUser.name,
          },
        },
      });

      const { password, ...result } = newUser;
      return result;
    } catch (error) {
      this.logger.error(`Error creating user: ${error.message}`);
      throw error;
    }
  }

  /**
   * Tìm tất cả người dùng với bộ lọc
   */
  async findAll(params: {
    page: number;
    limit: number;
    filters?: {
      role?: string;
      department?: string;
      search?: string;
    };
    currentUser?: any;
  }) {
    const { page = 1, limit = 10, filters = {}, currentUser } = params;
    const skip = (page - 1) * limit;

    try {
      // Xây dựng điều kiện where dựa trên quyền của người dùng
      let where: any = {};

      // Nếu có bộ lọc role
      if (filters.role) {
        where.role = filters.role;
      }

      // Nếu có bộ lọc department
      if (filters.department) {
        where.department = filters.department;
      }

      // Nếu có tìm kiếm
      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search } },
          { email: { contains: filters.search } },
        ];
      }

      // Nếu là TEACHER, chỉ có thể xem STUDENT do mình tạo
      if (currentUser && currentUser.role === Role.TEACHER) {
        where = {
          ...where,
          OR: [
            { id: currentUser.sub }, // Xem thông tin bản thân
            {
              createdById: currentUser.sub,
              role: Role.STUDENT,
            }, // Xem học sinh do mình tạo
          ],
        };
      }

      // Thực hiện truy vấn
      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where,
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            role: true,
            department: true,
            isActive: true,
            createdById: true,
            createdAt: true,
            updatedAt: true,
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.user.count({ where }),
      ]);

      return {
        data: users,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error(`Error finding users: ${error.message}`);
      throw error;
    }
  }

  /**
   * Tìm một người dùng theo ID
   */
  async findOne(id: number, currentUser?: any) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          department: true,
          isActive: true,
          createdById: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      // Kiểm tra quyền truy cập
      if (currentUser && currentUser.role === Role.TEACHER) {
        // TEACHER chỉ được xem thông tin của bản thân hoặc học sinh do mình tạo
        if (
          user.id !== currentUser.sub &&
          (user.role !== Role.STUDENT || user.createdById !== currentUser.sub)
        ) {
          throw new ForbiddenException(
            'You are not allowed to access this user',
          );
        }
      }

      return user;
    } catch (error) {
      this.logger.error(`Error finding user: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cập nhật thông tin người dùng
   */
  async update(id: number, updateData: any, currentUser?: any) {
    try {
      // Kiểm tra người dùng tồn tại
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      // Kiểm tra quyền
      if (currentUser) {
        if (currentUser.role === Role.TEACHER) {
          // TEACHER chỉ được cập nhật thông tin của học sinh do mình tạo
          if (
            id !== currentUser.sub &&
            (user.role !== Role.STUDENT || user.createdById !== currentUser.sub)
          ) {
            throw new ForbiddenException(
              'You are not allowed to update this user',
            );
          }

          // TEACHER không được thay đổi role của người dùng
          if (updateData.role && updateData.role !== user.role) {
            throw new ForbiddenException('Teachers cannot change user roles');
          }
        }
      }

      // Loại bỏ các trường không được phép cập nhật
      const { password, role, email, createdById, ...safeUpdateData } =
        updateData;

      // Cập nhật thông tin người dùng
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: safeUpdateData,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          department: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return {
        success: true,
        data: updatedUser,
      };
    } catch (error) {
      this.logger.error(`Error updating user: ${error.message}`);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Xóa người dùng
   */
  async remove(id: number, currentUser?: any) {
    try {
      // Kiểm tra người dùng tồn tại
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      // Kiểm tra quyền
      if (currentUser) {
        if (currentUser.role === Role.TEACHER) {
          // TEACHER chỉ được xóa học sinh do mình tạo
          if (
            user.role !== Role.STUDENT ||
            user.createdById !== currentUser.sub
          ) {
            throw new ForbiddenException(
              'Teachers can only delete their own students',
            );
          }
        } else if (currentUser.role === Role.ADMIN) {
          // ADMIN không được xóa ADMIN khác
          if (user.role === Role.ADMIN && user.id !== currentUser.sub) {
            throw new ForbiddenException('Admins cannot delete other admins');
          }
        }

        // Không ai được phép tự xóa mình
        if (id === currentUser.sub) {
          throw new ForbiddenException('You cannot delete your own account');
        }
      }

      // Xóa người dùng
      await this.prisma.user.delete({
        where: { id },
      });

      return {
        success: true,
        message: `User with ID ${id} has been successfully deleted`,
      };
    } catch (error) {
      this.logger.error(`Error deleting user: ${error.message}`);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Cập nhật trạng thái người dùng (active/inactive)
   */
  async updateStatus(id: number, isActive: boolean) {
    try {
      // Kiểm tra người dùng tồn tại
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      // Cập nhật trạng thái
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: { isActive },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
        },
      });

      return {
        success: true,
        data: updatedUser,
      };
    } catch (error) {
      this.logger.error(`Error updating user status: ${error.message}`);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Cập nhật vai trò người dùng
   */
  async updateRole(id: number, role: Role) {
    try {
      // Kiểm tra người dùng tồn tại
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      // Cập nhật vai trò
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: { role },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
        },
      });

      return {
        success: true,
        data: updatedUser,
      };
    } catch (error) {
      this.logger.error(`Error updating user role: ${error.message}`);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Thêm phương thức getStudentsByTeacher
  async getStudentsByTeacher(
    teacherId: number,
    page = 1,
    limit = 10,
    search?: string,
  ) {
    try {
      // Kiểm tra xem teacherId có tồn tại và là TEACHER không
      const teacher = await this.prisma.user.findFirst({
        where: {
          id: teacherId,
          role: Role.TEACHER,
        },
      });

      if (!teacher) {
        throw new NotFoundException(`Teacher with id ${teacherId} not found`);
      }

      // Tính toán skip cho phân trang
      const skip = (page - 1) * limit;

      // Tìm kiếm học sinh được tạo bởi giáo viên này
      const [students, total] = await Promise.all([
        this.prisma.user.findMany({
          where: {
            createdById: teacherId,
            role: Role.STUDENT,
            ...(search
              ? {
                  OR: [
                    { name: { contains: search } },
                    { email: { contains: search } },
                  ],
                }
              : {}),
          },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            department: true,
            isActive: true,
            createdAt: true,
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.user.count({
          where: {
            createdById: teacherId,
            role: Role.STUDENT,
            ...(search
              ? {
                  OR: [
                    { name: { contains: search } },
                    { email: { contains: search } },
                  ],
                }
              : {}),
          },
        }),
      ]);

      // Ghi log hoạt động
      await this.prisma.activity.create({
        data: {
          action: 'STUDENTS_LIST_VIEWED',
          details: {
            teacherId,
            studentsCount: students.length,
            page,
            limit,
          },
        },
      });

      return {
        data: students,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error(`Error getting students by teacher: ${error.message}`);
      throw error;
    }
  }
}
