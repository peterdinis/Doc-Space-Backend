import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';

export class CreateFolderDto {
  @ApiProperty({ description: 'Name of the folder' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: "Owner ID"
  })
  @IsString()
  @IsNotEmpty()
  ownerId!: string
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
