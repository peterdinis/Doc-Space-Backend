import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from '../user.service';
import { faker } from '@faker-js/faker';

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    document: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('myDocuments', () => {
    it('should return documents if found', async () => {
      const userId = faker.string.uuid();
      const mockDocs = Array.from({ length: 3 }).map(() => ({
        id: faker.string.uuid(),
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraph(),
        ownerId: userId,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      }));

      mockPrismaService.document.findMany.mockResolvedValue(mockDocs);

      const result = await service.myDocuments(userId);
      expect(result).toEqual(mockDocs);
      expect(prismaService.document.findMany).toHaveBeenCalledWith({
        where: { ownerId: userId },
      });
    });
  });
});
