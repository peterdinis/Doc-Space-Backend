import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { SharedDocumentsService } from './shared-documents.service';
import { CreateSharedDocumentDto } from './dto/create-shared-document.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Shared Documents')
@ApiBearerAuth()
@Controller('shared-documents')
export class SharedDocumentsController {
  constructor(private readonly service: SharedDocumentsService) {}

  @Post()
  async share(@Body() dto: CreateSharedDocumentDto) {
    return this.service.shareDocument(dto);
  }

  @Get('user/:userId')
  async getSharedWithUser(@Param('userId') userId: string) {
    return this.service.getSharedDocumentsByUser(userId);
  }

  @Delete(':documentId/:userId')
  async revoke(
    @Param('documentId') documentId: string,
    @Param('userId') userId: string,
  ) {
    return this.service.revokeAccess(documentId, userId);
  }
}
