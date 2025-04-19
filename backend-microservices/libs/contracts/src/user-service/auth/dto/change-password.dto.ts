import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class ChangePasswordDto {
  /**
   * Mật khẩu hiện tại
   */
  @IsNotEmpty()
  @IsString()
  currentPassword: string;

  /**
   * Mật khẩu mới
   */
  @IsNotEmpty()
  @IsString()
  @Length(8, 100)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số hoặc ký tự đặc biệt',
  })
  newPassword: string;

  /**
   * Xác nhận mật khẩu mới
   */
  @IsNotEmpty()
  @IsString()
  newPasswordConfirm: string;
}