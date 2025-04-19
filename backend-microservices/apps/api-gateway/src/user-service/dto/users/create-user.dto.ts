import { 
  IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, 
  IsOptional, IsEnum, Matches 
} from 'class-validator';
import { UserRole } from '../auth/enum/user-role.enum';

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(100)
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/, {
    message: 'Password too weak. Include at least one lowercase letter, uppercase letter, number, and special character.',
  })
  password: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;
}