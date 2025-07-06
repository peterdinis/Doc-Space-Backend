import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { PrismaService } from 'src/prisma/prisma.service';
import { DocumentService } from '../documents.service';
import { PrismaClient } from '@prisma/client';

describe('DocumentService', () => {
  let service: DocumentService;
  let prisma: jest.Mocked<PrismaService>;

  const mockUserId = faker.string.uuid();
  const mockDocId = faker.string.uuid();
  const mockDocument = {
    id: mockDocId,
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraph(),
    ownerId: mockUserId,
    status: 'draft',
    inTrash: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const prismaMock: jest.Mocked<PrismaService> = {
      document: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        deleteMany: jest.fn() as jest.Mock, // Explicitly cast to Jest mock
      },
      $transaction: jest.fn(),
    } as any; // Cast as any to allow partial mocks

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
    prisma = module.get(PrismaService);
  });

  describe('create', () => {
    it('should create a document', async () => {
      const dto = { title: mockDocument.title, content: mockDocument.content };
      prisma.document.create.mockResolvedValue(mockDocument);

      const result = await service.create(dto, mockUserId);

      expect(prisma.document.create).toHaveBeenCalledWith({
        data: {
          ...dto,
          ownerId: mockUserId,
        },
      });
      expect(result).toEqual(mockDocument);
    });

    it('should throw if title is empty', async () => {
      await expect(service.create({ title: '' }, mockUserId)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated documents', async () => {
      prisma.$transaction.mockResolvedValue([[mockDocument], 1]);

      const result = await service.findAll({}, mockUserId);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result).toEqual({
        data: [mockDocument],
        total: 1,
        page: 1,
        totalPages: 1,
      });
    });
  });

  describe('findOne', () => {
    it('should return a document if user owns it', async () => {
      prisma.document.findUnique.mockResolvedValue(mockDocument);

      const result = await service.findOne(mockDocId, mockUserId);

      expect(result).toEqual(mockDocument);
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.document.findUnique.mockResolvedValue(null);

      await expect(service.findOne(mockDocId, mockUserId)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user does not own it', async () => {
      prisma.document.findUnique.mockResolvedValue({
        ...mockDocument,
        ownerId: faker.string.uuid(), // different user
      });

      await expect(service.findOne(mockDocId, mockUserId)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('should update a document', async () => {
      prisma.document.findUnique.mockResolvedValue(mockDocument);
      prisma.document.update.mockResolvedValue({ ...mockDocument, title: 'Updated' });

      const result = await service.update(mockDocId, { title: 'Updated' }, mockUserId);

      expect(result.title).toBe('Updated');
    });

    it('should throw BadRequestException on empty title', async () => {
      prisma.document.findUnique.mockResolvedValue(mockDocument);

      await expect(
        service.update(mockDocId, { title: '' }, mockUserId)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should delete a document', async () => {
      prisma.document.findUnique.mockResolvedValue(mockDocument);
      prisma.document.delete.mockResolvedValue(mockDocument);

      const result = await service.remove(mockDocId, mockUserId);
      expect(result).toEqual(mockDocument);
    });
  });

  describe('moveToTrash', () => {
    it('should mark a document as trashed', async () => {
      prisma.document.findUnique.mockResolvedValue(mockDocument);
      prisma.document.update.mockResolvedValue({ ...mockDocument, inTrash: true });

      const result = await service.moveToTrash(mockDocId, mockUserId);
      expect(result.inTrash).toBe(true);
    });
  });

  describe('restoreFromTrash', () => {
    it('should restore a trashed document', async () => {
      prisma.document.findUnique.mockResolvedValue({ ...mockDocument, inTrash: true });
      prisma.document.update.mockResolvedValue({ ...mockDocument, inTrash: false });

      const result = await service.restoreFromTrash(mockDocId, mockUserId);
      expect(result.inTrash).toBe(false);
    });

    it('should throw if document is not in trash', async () => {
      prisma.document.findUnique.mockResolvedValue({ ...mockDocument, inTrash: false });

      await expect(service.restoreFromTrash(mockDocId, mockUserId)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('emptyTrash', () => {
    it('should delete all trashed documents', async () => {
      prisma.document.deleteMany.mockResolvedValue({ count: 3 });

      const result = await service.emptyTrash(mockUserId);
      expect(result.message).toContain('3 trashed document(s)');
    });
  });
});
