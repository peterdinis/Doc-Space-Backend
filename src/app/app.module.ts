import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import PrismaModule from 'src/prisma/prisma.module';
import { DocumentModule } from 'src/documents/documents.module';

@Module({
  imports: [PrismaModule, DocumentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
