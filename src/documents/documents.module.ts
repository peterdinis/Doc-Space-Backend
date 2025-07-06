import { Module } from '@nestjs/common';
import { DocumentController } from './documents.controller';
import { DocumentService } from './documents.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DocumentController],
  providers: [DocumentService],
})
export class DocumentModule {}