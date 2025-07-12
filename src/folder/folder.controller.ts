import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  ParseUUIDPipe,
  DefaultValuePipe,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FolderService } from './folder.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { CreateFolderDto, UpdateFolderDto } from './dto/folders.dto';

@ApiTags('folders')
@Controller('folders')
export class FolderController {
  constructor(private readonly folderService: FolderService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new folder' })
  @ApiResponse({ status: 201, description: 'Folder created successfully.' })
  @ApiBody({ type: CreateFolderDto })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async createFolder(
    @Body() createFolderDto: CreateFolderDto & { ownerId: string },
  ) {
    return this.folderService.createFolder(createFolderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get folders with pagination and search' })
  @ApiQuery({
    name: 'ownerId',
    required: true,
    description: 'ID of folder owner',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search query for folder name',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    example: 10,
  })
  async getFolders(
    @Query('ownerId', new ValidationPipe({ whitelist: true })) ownerId: string,
    @Query('search') search?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    return this.folderService.findFolders({ ownerId, search, page, limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get folder by ID' })
  @ApiParam({ name: 'id', description: 'Folder ID' })
  async getFolderById(@Param('id', ParseUUIDPipe) id: string) {
    return this.folderService.getFolderById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update folder by ID' })
  @ApiParam({ name: 'id', description: 'Folder ID' })
  @ApiBody({ type: UpdateFolderDto })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updateFolder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFolderDto: UpdateFolderDto,
  ) {
    return this.folderService.updateFolder(id, updateFolderDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete folder by ID' })
  @ApiParam({ name: 'id', description: 'Folder ID' })
  async deleteFolder(@Param('id', ParseUUIDPipe) id: string) {
    return this.folderService.deleteFolder(id);
  }
}
