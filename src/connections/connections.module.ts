import { Module } from '@nestjs/common';
import { ConnectionsController } from './connections.controller';
import { ConnectionService } from './connections.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ConnectionsController],
  providers: [ConnectionService],
})
export class ConnectionsModule {}
