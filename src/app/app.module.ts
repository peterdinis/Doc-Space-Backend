import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DocumentModule } from 'src/documents/documents.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { SharedDocumentsModule } from 'src/shared-documents/shared-documents.module';
import { ConnectionsModule } from 'src/connections/connections.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [PrismaModule, AuthModule, UserModule, DocumentModule, MailModule, ConnectionsModule, SharedDocumentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
;