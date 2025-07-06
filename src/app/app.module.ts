import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import PrismaModule from 'src/prisma/prisma.module';
import { MailModule } from 'src/mail/mail.module';
import { ConnectionsModule } from 'src/connections/connections.module';

@Module({
  imports: [PrismaModule, MailModule, ConnectionsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
