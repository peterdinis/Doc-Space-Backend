import { faker } from '@faker-js/faker/.';
import { Test, TestingModule } from '@nestjs/testing';
import { DocumentController } from '../documents.controller';
import { DocumentService } from '../documents.service';
import { CreateDocumentDto } from '../dto/create-document.dto';
import { DocumentStatusDto } from '../dto/document-status.dto';
import { QueryDocumentDto } from '../dto/query-document.dto';
import { UpdateDocumentDto } from '../dto/update-document.dto';
import { DocumentStatus } from '../../../generated/prisma';

describe('DocumentController', () => {
  let controller: DocumentController;
  let service: jest.Mocked<DocumentService>;

  const mockDocument = {
    id: faker.string.uuid(),
    title: faker.lorem.words(3),
    content: faker.lorem.paragraph(),
    ownerId: faker.string.uuid(),
    inTrash: false,
    status: 'DRAFT',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentController],
      providers: [
        {
          provide: DocumentService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockDocument),
            findAll: jest
              .fn()
              .mockResolvedValue({
                data: [mockDocument],
                total: 1,
                page: 1,
                totalPages: 1,
              }),
            getTrashed: jest.fn().mockResolvedValue([mockDocument]),
            moveToTrash: jest
              .fn()
              .mockResolvedValue({ ...mockDocument, inTrash: true }),
            restoreFromTrash: jest
              .fn()
              .mockResolvedValue({ ...mockDocument, inTrash: false }),
            emptyTrash: jest
              .fn()
              .mockResolvedValue({
                message: '1 trashed document(s) permanently deleted.',
              }),
            findOne: jest.fn().mockResolvedValue(mockDocument),
            update: jest
              .fn()
              .mockResolvedValue({ ...mockDocument, title: 'Updated Title' }),
            remove: jest.fn().mockResolvedValue(mockDocument),
            changeStatus: jest
              .fn()
              .mockResolvedValue({ ...mockDocument, status: 'DRAFT' }),
          },
        },
      ],
    }).compile();

    controller = module.get<DocumentController>(DocumentController);
    service = module.get(DocumentService);
  });

  it('should create a document', async () => {
    const dto: CreateDocumentDto = {
      title: mockDocument.title,
      content: mockDocument.content,
      userId: mockDocument.ownerId,
    };
    const result = await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(mockDocument);
  });

  it('should find all documents', async () => {
    const query: QueryDocumentDto = { userId: mockDocument.ownerId };
    const result = await controller.findAll(query);
    expect(service.findAll).toHaveBeenCalledWith(query);
    expect(result.data).toHaveLength(1);
  });

  it('should get trashed documents', async () => {
    const result = await controller.getTrashed(mockDocument.ownerId);
    expect(service.getTrashed).toHaveBeenCalledWith(mockDocument.ownerId);
    expect(result).toEqual([mockDocument]);
  });

  it('should move document to trash', async () => {
    const result = await controller.moveToTrash(
      mockDocument.id,
      mockDocument.ownerId,
    );
    expect(service.moveToTrash).toHaveBeenCalledWith(
      mockDocument.id,
      mockDocument.ownerId,
    );
    expect(result.inTrash).toBe(true);
  });

  it('should restore document from trash', async () => {
    const result = await controller.restoreFromTrash(
      mockDocument.id,
      mockDocument.ownerId,
    );
    expect(service.restoreFromTrash).toHaveBeenCalledWith(
      mockDocument.id,
      mockDocument.ownerId,
    );
    expect(result.inTrash).toBe(false);
  });

  it('should empty the trash', async () => {
    const result = await controller.emptyTrash(mockDocument.ownerId);
    expect(service.emptyTrash).toHaveBeenCalledWith(mockDocument.ownerId);
    expect(result.message).toMatch(/trashed document/);
  });

  it('should find a document by id', async () => {
    const result = await controller.findOne(
      mockDocument.id,
      mockDocument.ownerId,
    );
    expect(service.findOne).toHaveBeenCalledWith(
      mockDocument.id,
      mockDocument.ownerId,
    );
    expect(result).toEqual(mockDocument);
  });

  it('should update a document', async () => {
    const dto: UpdateDocumentDto = { title: 'Updated Title' };
    const result = await controller.update(
      mockDocument.id,
      dto,
      mockDocument.ownerId,
    );
    expect(service.update).toHaveBeenCalledWith(
      mockDocument.id,
      dto,
      mockDocument.ownerId,
    );
    expect(result.title).toBe('Updated Title');
  });

  it('should delete a document', async () => {
    const result = await controller.remove(
      mockDocument.id,
      mockDocument.ownerId,
    );
    expect(service.remove).toHaveBeenCalledWith(
      mockDocument.id,
      mockDocument.ownerId,
    );
    expect(result).toEqual(mockDocument);
  });

  it('should change document status', async () => {
    const body: DocumentStatusDto = { status: DocumentStatus.DRAFT };
    const result = await controller.changeStatus(
      mockDocument.id,
      body,
      mockDocument.ownerId,
    );
    expect(service.changeStatus).toHaveBeenCalledWith(
      mockDocument.id,
      DocumentStatus.DRAFT,
      mockDocument.ownerId,
    );
    expect(result.status).toBe(DocumentStatus.DRAFT);
  });
});
