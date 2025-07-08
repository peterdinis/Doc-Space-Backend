import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateConnectionDto {
  @ApiProperty()
  @IsString()
  receiverId: string;
}