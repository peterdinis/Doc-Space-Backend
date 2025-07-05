import {
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class DocumentGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private server: Server;

  afterInit(server: Server) {
    this.server = server;
    console.log('WebSocket Initialized');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-document')
  handleJoinDoc(@MessageBody() docId: string, @ConnectedSocket() client: Socket) {
    client.join(docId);
    client.to(docId).emit('user-joined', client.id);
  }

  @SubscribeMessage('leave-document')
  handleLeaveDoc(@MessageBody() docId: string, @ConnectedSocket() client: Socket) {
    client.leave(docId);
    client.to(docId).emit('user-left', client.id);
  }

  @SubscribeMessage('document-typing')
  handleTyping(@MessageBody() data: { docId: string; content: string }, @ConnectedSocket() client: Socket) {
    client.to(data.docId).emit('document-update', { content: data.content, user: client.id });
  }
}
