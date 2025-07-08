import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { AccessLevel } from '../../../generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { SharedDocumentsService } from '../shared-documents.service';
import { MailService } from 'src/mail/mail.service';

describe('SharedDocumentsService', () => {
  let service: SharedDocumentsService;

  const mockPrisma = {
    document: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    sharedDocument: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockMailService = {
    sendMail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SharedDocumentsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<SharedDocumentsService>(SharedDocumentsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('shareDocument', () => {
    const dto = {
      documentId: 'doc1',
      userId: 'user2',
      accessLevel: AccessLevel.EDIT,
    };

    it('throws if document not found', async () => {
      mockPrisma.document.findUnique.mockResolvedValue(null);

      await expect(service.shareDocument(dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws if user not found', async () => {
      mockPrisma.document.findUnique.mockResolvedValue({ id: 'doc1' });
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.shareDocument(dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws if already shared', async () => {
      mockPrisma.document.findUnique.mockResolvedValue({ id: 'doc1' });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user2' });
      mockPrisma.sharedDocument.findUnique.mockResolvedValue({
        id: 'existing',
      });

      await expect(service.shareDocument(dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('creates shared document successfully', async () => {
      mockPrisma.document.findUnique.mockResolvedValue({ id: 'doc1' });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user2' });
      mockPrisma.sharedDocument.findUnique.mockResolvedValue(null);
      mockPrisma.sharedDocument.create.mockResolvedValue({ id: 'new-share' });

      const result = await service.shareDocument(dto);
      expect(result).toEqual({ id: 'new-share' });
      expect(mockPrisma.sharedDocument.create).toHaveBeenCalled();
      expect(mockMailService.sendMail).toHaveBeenCalled(); // pokud to ve službě voláte
    });
  });

  describe('getSharedDocumentsByUser', () => {
    it('returns documents shared with user', async () => {
      mockPrisma.sharedDocument.findMany.mockResolvedValue([
        { id: 'share1' },
        { id: 'share2' },
      ]);

      const result = await service.getSharedDocumentsByUser('user1');
      expect(result.length).toBe(2);
    });
  });

  describe('revokeAccess', () => {
    it('revokes access successfully', async () => {
      mockPrisma.sharedDocument.delete.mockResolvedValue({ id: 'deleted' });

      const result = await service.revokeAccess('doc1', 'user1');
      expect(result).toEqual({ id: 'deleted' });
    });

    it('throws if access not found', async () => {
      mockPrisma.sharedDocument.delete.mockRejectedValue(new Error());

      await expect(service.revokeAccess('doc1', 'missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
