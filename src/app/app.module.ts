import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import PrismaModule from 'src/prisma/prisma.module';
import { MailModule } from 'src/mail/mail.module';
import { ConnectionsModule } from 'src/connections/connections.module';
import { SharedDocumentsModule } from 'src/shared-documents/shared-documents.module';

@Module({
  imports: [PrismaModule, MailModule, ConnectionsModule, SharedDocumentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
