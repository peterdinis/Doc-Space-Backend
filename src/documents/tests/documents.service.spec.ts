import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  DocumentStatus,
  Document as PrismaDocument,
} from '../../../generated/prisma';
import { faker } from '@faker-js/faker';
import { PrismaService } from 'src/prisma/prisma.service';
import { DocumentService } from '../documents.service';

interface CreateDocumentDto {
  title: string;
  userId: string;
}

interface UpdateDocumentDto {
  title: string;
}

const mockPrisma = {
  document: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  $transaction: jest.fn(),
};

describe('DocumentService', () => {
  let service: DocumentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should throw if title is empty', async () => {
      const dto: CreateDocumentDto = { title: '', userId: faker.string.uuid() };
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should create a document', async () => {
      const dto: CreateDocumentDto = {
        title: faker.lorem.sentence(),
        userId: faker.string.uuid(),
      };
      const mockDocument: PrismaDocument = {
        id: faker.string.uuid(),
        title: dto.title,
        ownerId: dto.userId,
        content: '',
        status: DocumentStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
        inTrash: false,
      };

      mockPrisma.document.create.mockResolvedValue(mockDocument);

      const result = await service.create(dto);
      expect(result).toEqual(mockDocument);
      expect(mockPrisma.document.create).toHaveBeenCalledWith({
        data: { ...dto, ownerId: dto.userId },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated documents', async () => {
      const query = {
        userId: faker.string.uuid(),
        page: 1,
        limit: 2,
        search: faker.word.words(),
      };

      const docs: PrismaDocument[] = [
        {
          id: faker.string.uuid(),
          title: faker.lorem.sentence(),
          ownerId: query.userId,
          content: '',
          status: DocumentStatus.DRAFT,
          createdAt: new Date(),
          updatedAt: new Date(),
          inTrash: false,
        },
        {
          id: faker.string.uuid(),
          title: faker.lorem.sentence(),
          ownerId: query.userId,
          content: '',
          status: DocumentStatus.DRAFT,
          createdAt: new Date(),
          updatedAt: new Date(),
          inTrash: false,
        },
      ];

      mockPrisma.$transaction.mockResolvedValue([docs, 5]);

      const result = await service.findAll(query);
      expect(result.data).toEqual(docs);
      expect(result.total).toBe(5);
      expect(result.totalPages).toBe(3);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if not found', async () => {
      mockPrisma.document.findUnique.mockResolvedValue(null);
      await expect(
        service.findOne(faker.string.uuid(), faker.string.uuid()),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if not owner', async () => {
      mockPrisma.document.findUnique.mockResolvedValue({
        id: faker.string.uuid(),
        ownerId: faker.string.uuid(),
      } as PrismaDocument);

      await expect(
        service.findOne(faker.string.uuid(), faker.string.uuid()),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should return document if found and authorized', async () => {
      const userId = faker.string.uuid();
      const doc: PrismaDocument = {
        id: faker.string.uuid(),
        ownerId: userId,
        title: faker.lorem.words(),
        content: '',
        status: DocumentStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
        inTrash: false,
      };

      mockPrisma.document.findUnique.mockResolvedValue(doc);

      const result = await service.findOne(doc.id, userId);
      expect(result).toEqual(doc);
    });
  });

  describe('update', () => {
    it('should throw if title is blank', async () => {
      const userId = faker.string.uuid();
      const docId = faker.string.uuid();

      jest.spyOn(service, 'findOne').mockResolvedValue({
        id: docId,
        ownerId: userId,
      } as PrismaDocument);

      const dto: UpdateDocumentDto = { title: ' ' };

      await expect(service.update(docId, dto, userId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should update document', async () => {
      const userId = faker.string.uuid();
      const docId = faker.string.uuid();
      const title = faker.lorem.words();

      jest.spyOn(service, 'findOne').mockResolvedValue({
        id: docId,
        ownerId: userId,
      } as PrismaDocument);

      const updated: PrismaDocument = {
        id: docId,
        title,
        ownerId: userId,
        content: '',
        status: DocumentStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
        inTrash: false,
      };

      mockPrisma.document.update.mockResolvedValue(updated);

      const result = await service.update(docId, { title }, userId);
      expect(result.title).toBe(title);
    });
  });

  describe('remove', () => {
    it('should delete document', async () => {
      const doc: PrismaDocument = {
        id: faker.string.uuid(),
        ownerId: faker.string.uuid(),
        title: '',
        content: '',
        status: DocumentStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
        inTrash: false,
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(doc);
      mockPrisma.document.delete.mockResolvedValue(doc);

      const result = await service.remove(doc.id, doc.ownerId);
      expect(result.id).toBe(doc.id);
    });
  });

  describe('removeAll', () => {
    it('should delete all documents for user', async () => {
      const userId = faker.string.uuid();
      mockPrisma.document.deleteMany.mockResolvedValue({ count: 4 });

      const result = await service.removeAll(userId);
      expect(result.message).toBe('4 document(s) deleted');
    });
  });

  describe('moveToTrash', () => {
    it('should move document to trash', async () => {
      const doc: PrismaDocument = {
        id: faker.string.uuid(),
        ownerId: faker.string.uuid(),
        title: '',
        content: '',
        status: DocumentStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
        inTrash: false,
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(doc);
      mockPrisma.document.update.mockResolvedValue({ ...doc, inTrash: true });

      const result = await service.moveToTrash(doc.id, doc.ownerId);
      expect(result.inTrash).toBe(true);
    });
  });

  describe('restoreFromTrash', () => {
    it('should throw if document is not in trash', async () => {
      const doc: PrismaDocument = {
        id: faker.string.uuid(),
        ownerId: faker.string.uuid(),
        inTrash: false,
        title: '',
        content: '',
        status: DocumentStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(doc);

      await expect(
        service.restoreFromTrash(doc.id, doc.ownerId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should restore document', async () => {
      const doc: PrismaDocument = {
        id: faker.string.uuid(),
        ownerId: faker.string.uuid(),
        inTrash: true,
        title: '',
        content: '',
        status: DocumentStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(doc);
      mockPrisma.document.update.mockResolvedValue({ ...doc, inTrash: false });

      const result = await service.restoreFromTrash(doc.id, doc.ownerId);
      expect(result.inTrash).toBe(false);
    });
  });

  describe('getTrashed', () => {
    it('should return trashed documents', async () => {
      const userId = faker.string.uuid();
      const trashed: PrismaDocument[] = [
        {
          id: faker.string.uuid(),
          ownerId: userId,
          inTrash: true,
          title: '',
          content: '',
          status: DocumentStatus.DRAFT,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.document.findMany.mockResolvedValue(trashed);

      const result = await service.getTrashed(userId);
      expect(result).toEqual(trashed);
    });
  });

  describe('emptyTrash', () => {
    it('should delete all trashed documents', async () => {
      const userId = faker.string.uuid();
      mockPrisma.document.deleteMany.mockResolvedValue({ count: 2 });

      const result = await service.emptyTrash(userId);
      expect(result.message).toContain(
        '2 trashed document(s) permanently deleted.',
      );
    });
  });

  describe('changeStatus', () => {
    it('should update document status', async () => {
      const doc: PrismaDocument = {
        id: faker.string.uuid(),
        ownerId: faker.string.uuid(),
        inTrash: false,
        title: '',
        content: '',
        status: DocumentStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newStatus = DocumentStatus.IN_TRASH;

      jest.spyOn(service, 'findOne').mockResolvedValue(doc);
      mockPrisma.document.update.mockResolvedValue({
        ...doc,
        status: newStatus,
      });

      const result = await service.changeStatus(doc.id, newStatus, doc.ownerId);
      expect(result.status).toBe(newStatus);
    });
  });
});
