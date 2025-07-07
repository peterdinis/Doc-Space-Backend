import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { DocumentService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { QueryDocumentDto } from './dto/query-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@ApiTags('Documents')
@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new document' })
  @ApiResponse({ status: 201, description: 'Document created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  create(@Body() dto: CreateDocumentDto) {
    return this.documentService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get paginated list of user documents (not in trash)',
  })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Paginated list of documents' })
  findAll(@Query() query: QueryDocumentDto, @CurrentUser('id') userId: string) {
    return this.documentService.findAll(query, userId);
  }

  @Get('trash/all')
  @ApiOperation({ summary: 'Get all documents in trash' })
  @ApiResponse({ status: 200, description: 'List of trashed documents' })
  getTrashed(@CurrentUser('id') userId: string) {
    return this.documentService.getTrashed(userId);
  }

  @Post(':id/trash')
  @ApiOperation({ summary: 'Move document to trash' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Document moved to trash' })
  moveToTrash(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.documentService.moveToTrash(id, userId);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore document from trash' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Document restored from trash' })
  restoreFromTrash(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.documentService.restoreFromTrash(id, userId);
  }

  @Delete('trash/empty')
  @ApiOperation({ summary: 'Permanently delete all trashed documents' })
  @ApiResponse({ status: 200, description: 'Trash emptied' })
  emptyTrash(@CurrentUser('id') userId: string) {
    return this.documentService.emptyTrash(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a document by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Document UUID' })
  @ApiResponse({ status: 200, description: 'Document found' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.documentService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a document by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Document updated' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDocumentDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.documentService.update(id, dto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a document by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Document deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.documentService.remove(id, userId);
  }
}
