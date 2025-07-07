import { Test, TestingModule } from '@nestjs/testing';
import { AccessLevel } from '../../../generated/prisma';
import { SharedDocumentsController } from '../shared-couments.controller';
import { SharedDocumentsService } from '../shared-documents.service';


describe('SharedDocumentsController', () => {
  let controller: SharedDocumentsController;
  let service: SharedDocumentsService;

  const mockService = {
    shareDocument: jest.fn(),
    getSharedDocumentsByUser: jest.fn(),
    revokeAccess: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SharedDocumentsController],
      providers: [{ provide: SharedDocumentsService, useValue: mockService }],
    }).compile();

    controller = module.get<SharedDocumentsController>(SharedDocumentsController);
    service = module.get<SharedDocumentsService>(SharedDocumentsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('calls service.shareDocument on POST', async () => {
    const dto = {
      documentId: 'doc1',
      userId: 'user2',
      accessLevel: AccessLevel.VIEW,
    };

    mockService.shareDocument.mockResolvedValue({ id: 'sharedId' });
    const result = await controller.share(dto);

    expect(mockService.shareDocument).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ id: 'sharedId' });
  });

  it('calls service.getSharedDocumentsByUser on GET', async () => {
    mockService.getSharedDocumentsByUser.mockResolvedValue([{ id: 'docA' }]);
    const result = await controller.getSharedWithUser('user1');

    expect(mockService.getSharedDocumentsByUser).toHaveBeenCalledWith('user1');
    expect(result).toEqual([{ id: 'docA' }]);
  });

  it('calls service.revokeAccess on DELETE', async () => {
    mockService.revokeAccess.mockResolvedValue({ id: 'revoked' });
    const result = await controller.revoke('doc1', 'user1');

    expect(mockService.revokeAccess).toHaveBeenCalledWith('doc1', 'user1');
    expect(result).toEqual({ id: 'revoked' });
  });
});