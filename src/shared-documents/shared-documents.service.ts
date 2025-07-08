import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSharedDocumentDto } from './dto/create-shared-document.dto';

@Injectable()
export class SharedDocumentsService {
  constructor(private prisma: PrismaService) {}

  async shareDocument(dto: CreateSharedDocumentDto) {
    const { documentId, userId, accessLevel } = dto;

    // Ensure document exists
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Ensure user exists
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if already shared
    const existing = await this.prisma.sharedDocument.findUnique({
      where: {
        documentId_userId: {
          documentId,
          userId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Document already shared with this user');
    }

    try {
      return await this.prisma.sharedDocument.create({
        data: {
          documentId,
          userId,
          accessLevel,
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to share document');
    }
  }

  async getSharedDocumentsByUser(userId: string) {
    return this.prisma.sharedDocument.findMany({
      where: { userId },
      include: {
        document: true,
      },
    });
  }

  async revokeAccess(documentId: string, userId: string) {
    try {
      return await this.prisma.sharedDocument.delete({
        where: {
          documentId_userId: {
            documentId,
            userId,
          },
        },
      });
    } catch (err) {
      throw new NotFoundException('Shared access not found');
    }
  }
}
