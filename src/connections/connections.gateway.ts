import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ConnectionsService } from './connections.service';
import { ConnectionStatus } from '../../generated/prisma';

@WebSocketGateway({ cors: true })
export class ConnectionsGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly connectionsService: ConnectionsService) {}

  @SubscribeMessage('updateConnectionStatus')
  async handleUpdateStatus(
    @MessageBody() payload: { id: string; status: string },
  ) {
    const connection = await this.connectionsService.updateStatus(payload.id, {
      status: payload.status as ConnectionStatus,
    });

    this.server.emit('connectionStatusUpdated', connection);
  }
}
