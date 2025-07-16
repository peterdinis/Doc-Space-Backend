import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSharedDocumentDto } from './dto/create-shared-document.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class SharedDocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async shareDocument(dto: CreateSharedDocumentDto) {
    const { documentId, userId, accessLevel } = dto;

    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

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
      const shared = await this.prisma.sharedDocument.create({
        data: {
          documentId,
          userId,
          accessLevel,
        },
      });

      const sender = await this.prisma.user.findUnique({
        where: { id: document.userId },
      });

      if (sender) {
        await this.mailService.sendDocumentSharedEmail(
          user.email,
          user.name!,
          sender.name!,
          document.title,
          `https://your-app.com/documents/${document.id}`,
        );
      }

      return shared;
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
