import { PrismaService } from '../prisma.service';

describe('PrismaService', () => {
  let prismaService: PrismaService;

  beforeEach(() => {
    prismaService = new PrismaService();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should call $connect on onModuleInit', async () => {
    const connectSpy = jest
      .spyOn(prismaService, '$connect')
      .mockResolvedValue(undefined);

    await prismaService.onModuleInit();

    expect(connectSpy).toHaveBeenCalled();
  });
});
