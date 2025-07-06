import { Module } from '@nestjs/common';
import { DocumentController } from './documents.controller';
import { DocumentService } from './documents.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { DocumentGateway } from './documents.gateway';
import { DocumentStatus } from 'generated/prisma';

@Module({
  imports: [PrismaModule],
  providers: [DocumentService],
  controllers: [DocumentController],
})
export class DocumentModule {}
