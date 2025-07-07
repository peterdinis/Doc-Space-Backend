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
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    DocumentModule,
    MailModule,
    ConnectionsModule,
    SharedDocumentsModule,
    MailModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
