import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DocumentService } from './documents.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class DocumentGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly documentService: DocumentService) {}

  private documentRooms = new Map<string, Set<string>>();

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    for (const [docId, clients] of this.documentRooms.entries()) {
      if (clients.has(client.id)) {
        clients.delete(client.id);
        this.documentRooms.set(docId, clients);
        client.leave(docId);
        this.server.to(docId).emit('userLeft', { socketId: client.id });
      }
    }
  }

  @SubscribeMessage('joinDocument')
  async onJoinDocument(
    @MessageBody() data: { documentId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      await this.documentService.findOne(data.documentId, data.userId);
    } catch (error) {
      client.emit('error', 'Access denied or document not found');
      return;
    }

    client.join(data.documentId);

    const clients = this.documentRooms.get(data.documentId) || new Set();
    clients.add(client.id);
    this.documentRooms.set(data.documentId, clients);

    client.emit('joinedDocument', { documentId: data.documentId });
    this.server.to(data.documentId).emit('userJoined', { socketId: client.id });

    console.log(`Client ${client.id} joined document ${data.documentId}`);
  }

  @SubscribeMessage('editDocument')
  async onEditDocument(
    @MessageBody() data: { documentId: string; content: any; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      await this.documentService.findOne(data.documentId, data.userId);
    } catch (error) {
      client.emit('error', 'Access denied or document not found');
      return;
    }
    
    await this.documentService.update(
      data.documentId,
      { content: data.content },
      data.userId,
    );

    client.to(data.documentId).emit('documentUpdated', {
      documentId: data.documentId,
      content: data.content,
      updatedBy: data.userId,
    });
  }
}
