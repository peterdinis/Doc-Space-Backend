import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { AccessLevel } from '../../../generated/prisma';

export class CreateSharedDocumentDto {
  @IsString()
  @IsNotEmpty()
  documentId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEnum(AccessLevel)
  accessLevel: AccessLevel;
}