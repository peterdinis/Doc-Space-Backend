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
    origin: '*', // Adjust for your client URL in prod
  },
})
export class DocumentGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly documentService: DocumentService) {}

  // Map to track which sockets are in which document room
  private documentRooms = new Map<string, Set<string>>(); // documentId => Set of socket ids

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // Remove client from all rooms
    for (const [docId, clients] of this.documentRooms.entries()) {
      if (clients.has(client.id)) {
        clients.delete(client.id);
        this.documentRooms.set(docId, clients);
        client.leave(docId);
        // Optionally notify others user left document
        this.server.to(docId).emit('userLeft', { socketId: client.id });
      }
    }
  }

  // Join document room
  @SubscribeMessage('joinDocument')
  async onJoinDocument(
    @MessageBody() data: { documentId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    // Verify document exists and user has access
    try {
      await this.documentService.findOne(data.documentId, data.userId);
    } catch (error) {
      client.emit('error', 'Access denied or document not found');
      return;
    }

    client.join(data.documentId);

    // Track client in room
    const clients = this.documentRooms.get(data.documentId) || new Set();
    clients.add(client.id);
    this.documentRooms.set(data.documentId, clients);

    client.emit('joinedDocument', { documentId: data.documentId });
    this.server.to(data.documentId).emit('userJoined', { socketId: client.id });

    console.log(`Client ${client.id} joined document ${data.documentId}`);
  }

  // Handle real-time document changes sent by clients
  @SubscribeMessage('editDocument')
  async onEditDocument(
    @MessageBody() data: { documentId: string; content: any; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    // Validate permission before broadcasting
    try {
      await this.documentService.findOne(data.documentId, data.userId);
    } catch (error) {
      client.emit('error', 'Access denied or document not found');
      return;
    }

    // Optionally, you can debounce or throttle saving to DB here
    // For demo: save immediately (can add try/catch)
    await this.documentService.update(data.documentId, { content: data.content }, data.userId);

    // Broadcast change to others in room except sender
    client.to(data.documentId).emit('documentUpdated', {
      documentId: data.documentId,
      content: data.content,
      updatedBy: data.userId,
    });
  }
}
