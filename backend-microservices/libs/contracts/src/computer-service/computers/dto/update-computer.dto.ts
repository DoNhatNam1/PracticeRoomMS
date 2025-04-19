import { PartialType } from '@nestjs/mapped-types';
import { CreateComputerDto } from './create-computer.dto';

export class UpdateComputerDto extends PartialType(CreateComputerDto) {
  id: number;
}
