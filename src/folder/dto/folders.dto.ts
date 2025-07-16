import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt, Min, IsArray } from 'class-validator';
import { Document } from 'generated/prisma';

export class CreateFolderDto {
  @ApiProperty({ description: 'Name of the folder' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Owner ID',
  })
  @IsString()
  @IsNotEmpty()
  ownerId!: string;

  @ApiProperty({
    description: "Documents for folder"
  })
  @IsArray()
  documents: Document[]
}

export class UpdateFolderDto {
  @ApiPropertyOptional({ description: 'New name of the folder' })
  @IsString()
  @IsOptional()
  name?: string;
}

export class FindFoldersDto {
  @ApiProperty({ description: 'Owner ID of the folders' })
  @IsString()
  ownerId!: string;

  @ApiPropertyOptional({ description: 'Search term for folder name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Items per page for pagination',
    default: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}
