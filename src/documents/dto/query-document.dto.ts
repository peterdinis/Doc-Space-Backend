import { IsOptional, IsString, IsEnum } from 'class-validator';
import { DocumentStatus } from 'generated/prisma';

export class QueryDocumentDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}