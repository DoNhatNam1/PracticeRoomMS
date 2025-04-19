import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString, MinLength, Matches, IsEmail, IsEnum, IsBoolean } from 'class-validator';
import { UserRole } from 'apps/api-gateway/src/user-service/dto/auth/enum/user-role.enum';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString({ message: 'Tên đăng nhập phải là chuỗi ký tự' })
  @MinLength(3, { message: 'Tên đăng nhập phải có ít nhất 3 ký tự' })
  @Matches(/^[a-zA-Z0-9_-]+$/, { message: 'Tên đăng nhập chỉ được chứa chữ cái, số, gạch dưới và gạch ngang' })
  username?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Họ tên phải là chuỗi ký tự' })
  @MinLength(2, { message: 'Họ tên phải có ít nhất 2 ký tự' })
  fullName?: string;

  @IsOptional()
  @IsString({ message: 'Khoa/Phòng ban phải là chuỗi ký tự' })
  department?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Vai trò không hợp lệ' })
  role?: UserRole;

  @IsOptional()
  @IsBoolean({ message: 'Trạng thái hoạt động phải là kiểu boolean' })
  isActive?: boolean;
}