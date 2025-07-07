import { Module } from '@nestjs/common';
import { DocumentController } from './documents.controller';
import { DocumentService } from './documents.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { DocumentGateway } from './documents.gateway';

@Module({
  imports: [PrismaModule],
  providers: [DocumentService, DocumentGateway],
  controllers: [DocumentController],
})
export class DocumentModule {}
