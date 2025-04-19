import { Role } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';


export class RegisterUserDto {
  /**
   * Username đăng ký
   */
  @IsNotEmpty()
  @IsString()
  @Length(3, 50)
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Username chỉ được chứa chữ cái, số, dấu gạch dưới và gạch ngang',
  })
  username: string;

  /**
   * Email đăng ký
   */
  @IsNotEmpty()
  @IsEmail()
  email: string;

  /**
   * Mật khẩu đăng ký
   */
  @IsNotEmpty()
  @IsString()
  @Length(8, 100)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số hoặc ký tự đặc biệt',
  })
  password: string;

  /**
   * Họ tên đầy đủ của người dùng
   */
  @IsNotEmpty()
  @IsString()
  @Length(2, 100)
  fullName: string;

  /**
   * Khoa/ngành học (tùy chọn)
   */
  @IsOptional()
  @IsString()
  department?: string;

  /**
   * Vai trò của người dùng (mặc định là STUDENT)
   */
  @IsOptional()
  @IsEnum(Role)
  role?: Role = Role.STUDENT;
}