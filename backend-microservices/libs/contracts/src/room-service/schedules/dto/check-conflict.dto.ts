import { IsNotEmpty, IsInt, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CheckConflictDto {
  @IsNotEmpty()
  @IsInt()
  roomId: number;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  startTime: Date;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  endTime: Date;
}