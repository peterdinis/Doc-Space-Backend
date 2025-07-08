import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SharedDocumentsService } from './shared-documents.service';
import { SharedDocumentsController } from './shared-couments.controller';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [PrismaModule, MailModule],
  providers: [SharedDocumentsService],
  controllers: [SharedDocumentsController],
})
export class SharedDocumentsModule {}
