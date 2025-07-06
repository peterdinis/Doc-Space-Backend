import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
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

@ApiTags('Documents')
@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new document' })
  @ApiResponse({ status: 201, description: 'Document created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  create(@Body() dto: CreateDocumentDto, @Req() req) {
    return this.documentService.create(dto, req.user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Get paginated list of user documents (not in trash)',
  })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Paginated list of documents' })
  findAll(@Query() query: QueryDocumentDto, @Req() req) {
    return this.documentService.findAll(query, req.user.id);
  }

  @Get('trash/all')
  @ApiOperation({ summary: 'Get all documents in trash' })
  @ApiResponse({ status: 200, description: 'List of trashed documents' })
  getTrashed(@Req() req) {
    return this.documentService.getTrashed(req.user.id);
  }

  @Post(':id/trash')
  @ApiOperation({ summary: 'Move document to trash' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Document moved to trash' })
  moveToTrash(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    return this.documentService.moveToTrash(id, req.user.id);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore document from trash' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Document restored from trash' })
  restoreFromTrash(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    return this.documentService.restoreFromTrash(id, req.user.id);
  }

  @Delete('trash/empty')
  @ApiOperation({ summary: 'Permanently delete all trashed documents' })
  @ApiResponse({ status: 200, description: 'Trash emptied' })
  emptyTrash(@Req() req) {
    return this.documentService.emptyTrash(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a document by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Document UUID' })
  @ApiResponse({ status: 200, description: 'Document found' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    return this.documentService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a document by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Document updated' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDocumentDto,
    @Req() req,
  ) {
    return this.documentService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a document by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Document deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    return this.documentService.remove(id, req.user.id);
  }
}
