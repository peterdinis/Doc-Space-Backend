import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class DocumentGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('DocumentGateway');

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway Initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Example: Handle document updates
  @SubscribeMessage('document-update')
  handleDocumentUpdate(client: Socket, payload: any): void {
    const { documentId, content } = payload;

    // Broadcast to all clients in the same document room
    client.to(documentId).emit('document-update', content);
  }

  @SubscribeMessage('join-document')
  handleJoinDocument(client: Socket, payload: { documentId: string }) {
    client.join(payload.documentId);
    this.logger.log(`Client ${client.id} joined room: ${payload.documentId}`);
  }

  @SubscribeMessage('leave-document')
  handleLeaveDocument(client: Socket, payload: { documentId: string }) {
    client.leave(payload.documentId);
    this.logger.log(`Client ${client.id} left room: ${payload.documentId}`);
  }
}