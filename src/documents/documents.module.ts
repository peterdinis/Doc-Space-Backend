import { Module } from '@nestjs/common';
import PrismaModule from 'src/prisma/prisma.module';
import { DocumentController } from './documents.controller';
import { DocumentService } from './documents.service';
import { DocumentGateway } from './documents.gateway';

@Module({
  imports: [PrismaModule],
  controllers: [DocumentController],
  providers: [DocumentService, DocumentGateway],
})
export class DocumentModule {}
