import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionStatus } from '../../../generated/prisma';
import { faker } from '@faker-js/faker';
import { ConnectionsController } from '../connections.controller';
import { ConnectionsService } from '../connections.service';
import { CreateConnectionDto } from '../dto/create-connection.dto';
import { UpdateConnectionDto } from '../dto/update-connection.dto';

describe('ConnectionsController', () => {
  let controller: ConnectionsController;
  let service: ConnectionsService;

  const mockConnectionsService = {
    create: jest.fn(),
    findUserConnections: jest.fn(),
    updateStatus: jest.fn(),
  };

  const mockUser = { id: faker.string.uuid() };
  const mockReq = { user: mockUser };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConnectionsController],
      providers: [
        { provide: ConnectionsService, useValue: mockConnectionsService },
      ],
    }).compile();

    controller = module.get<ConnectionsController>(ConnectionsController);
    service = module.get<ConnectionsService>(ConnectionsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('should call connectionsService.create with user id and dto', async () => {
      const dto: CreateConnectionDto = {
        receiverId: faker.string.uuid(),
      };

      const mockConnection = { id: faker.string.uuid() };
      mockConnectionsService.create.mockResolvedValue(mockConnection);

      const result = await controller.create(mockReq, dto);

      expect(service.create).toHaveBeenCalledWith(mockUser.id, dto);
      expect(result).toEqual(mockConnection);
    });
  });

  describe('findMine', () => {
    it('should call findUserConnections with defaults if query params are missing', async () => {
      const mockConnections = [
        { id: faker.string.uuid() },
        { id: faker.string.uuid() },
      ];
      mockConnectionsService.findUserConnections.mockResolvedValue(mockConnections);

      const result = await controller.findMine(mockReq);

      expect(service.findUserConnections).toHaveBeenCalledWith(
        mockUser.id,
        undefined,
        1,
        10,
      );
      expect(result).toEqual(mockConnections);
    });

    it('should call findUserConnections with query params', async () => {
      const status = ConnectionStatus.ACCEPTED;
      const page = faker.number.int({ min: 2, max: 5 });
      const limit = faker.number.int({ min: 5, max: 20 });

      const mockConnections = [{ id: faker.string.uuid() }];
      mockConnectionsService.findUserConnections.mockResolvedValue(mockConnections);

      const result = await controller.findMine(mockReq, status, page, limit);

      expect(service.findUserConnections).toHaveBeenCalledWith(
        mockUser.id,
        status,
        page,
        limit,
      );
      expect(result).toEqual(mockConnections);
    });
  });

  describe('update', () => {
    it('should call updateStatus with connection id and dto', async () => {
      const connectionId = faker.string.uuid();
      const dto: UpdateConnectionDto = {
        status: ConnectionStatus.BLOCKED,
      };

      const mockResult = { id: connectionId };
      mockConnectionsService.updateStatus.mockResolvedValue(mockResult);

      const result = await controller.update(connectionId, dto);

      expect(service.updateStatus).toHaveBeenCalledWith(connectionId, dto);
      expect(result).toEqual(mockResult);
    });
  });
});
