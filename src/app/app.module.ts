import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DocumentModule } from 'src/documents/documents.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';


@Module({
  imports: [PrismaModule, AuthModule, UserModule, DocumentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
;