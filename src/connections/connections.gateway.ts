import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ConnectionsService } from './connections.service';

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
      status: payload.status as any,
    });

    this.server.emit('connectionStatusUpdated', connection);
  }
}
