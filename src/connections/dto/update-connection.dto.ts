import { IsEnum } from 'class-validator';
import { ConnectionStatus } from 'generated/prisma';

export class UpdateConnectionDto {
  @IsEnum(ConnectionStatus)
  status: ConnectionStatus;
}