import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { DocumentStatus } from '../../../generated/prisma';

export class DocumentStatusDto {
  @ApiProperty()
  @IsEnum(DocumentStatus)
  status: DocumentStatus;
}
