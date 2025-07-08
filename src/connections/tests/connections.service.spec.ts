import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ConnectionsService } from '../connections.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConnectionStatus } from 'generated/prisma';
import { faker } from '@faker-js/faker';

describe('ConnectionsService', () => {
  let service: ConnectionsService;
  let prismaMock: {
    connection: {
      create: jest.Mock,
      findMany: jest.Mock,
      count: jest.Mock,
      findUnique: jest.Mock,
      update: jest.Mock,
    };
  };

  beforeEach(async () => {
    prismaMock = {
      connection: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConnectionsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<ConnectionsService>(ConnectionsService);
  });

  describe('create', () => {
    it('should create a new connection', async () => {
      const requesterId = faker.string.uuid();
      const receiverId = faker.string.uuid();
      const mockConnection = {
        id: faker.string.uuid(),
        requesterId,
        receiverId,
        status: ConnectionStatus.PENDING,
        createdAt: new Date(),
      };

      prismaMock.connection.create.mockResolvedValue(mockConnection);

      const result = await service.create(requesterId, { receiverId });

      expect(prismaMock.connection.create).toHaveBeenCalledWith({
        data: { requesterId, receiverId },
      });
      expect(result).toEqual(mockConnection);
    });
  });

  describe('findUserConnections', () => {
    it('should return paginated connections', async () => {
      const userId = faker.string.uuid();
      const connections = Array.from({ length: 3 }).map(() => ({
        id: faker.string.uuid(),
        requesterId: userId,
        receiverId: faker.string.uuid(),
        status: ConnectionStatus.ACCEPTED,
        createdAt: new Date(),
        requester: { id: userId, email: faker.internet.email() },
        receiver: { id: faker.string.uuid(), email: faker.internet.email() },
      }));

      prismaMock.connection.findMany.mockResolvedValue(connections);
      prismaMock.connection.count.mockResolvedValue(3);

      const result = await service.findUserConnections(userId, ConnectionStatus.ACCEPTED, 1, 10);

      expect(prismaMock.connection.findMany).toHaveBeenCalled();
      expect(prismaMock.connection.count).toHaveBeenCalled();
      expect(result.data).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('updateStatus', () => {
    it('should update connection status', async () => {
      const id = faker.string.uuid();
      const newStatus = ConnectionStatus.BLOCKED;

      const mockConnection = {
        id,
        requesterId: faker.string.uuid(),
        receiverId: faker.string.uuid(),
        status: ConnectionStatus.PENDING,
        createdAt: new Date(),
      };

      const updatedConnection = {
        ...mockConnection,
        status: newStatus,
      };

      prismaMock.connection.findUnique.mockResolvedValue(mockConnection);
      prismaMock.connection.update.mockResolvedValue(updatedConnection);

      const result = await service.updateStatus(id, { status: newStatus });

      expect(prismaMock.connection.findUnique).toHaveBeenCalledWith({ where: { id } });
      expect(prismaMock.connection.update).toHaveBeenCalledWith({
        where: { id },
        data: { status: newStatus },
      });
      expect(result.status).toBe(newStatus);
    });

    it('should throw NotFoundException if connection does not exist', async () => {
      const id = faker.string.uuid();
      prismaMock.connection.findUnique.mockResolvedValue(null);

      await expect(
        service.updateStatus(id, { status: ConnectionStatus.ACCEPTED }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
