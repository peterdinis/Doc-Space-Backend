import { Module } from '@nestjs/common';
import { ConnectionsController } from './connections.controller';
import { ConnectionsService } from './connections.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConnectionsGateway } from './connections.gateway';

@Module({
  imports: [PrismaModule],
  controllers: [ConnectionsController],
  providers: [ConnectionsService, ConnectionsGateway],
})
export class ConnectionsModule {}
