import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should call AuthService.register and return result', async () => {
      const dto = {
        email: faker.internet.email(),
        password: faker.internet.password(),
        name: faker.person.fullName(),
      };

      const mockResult = {
        access_token: 'jwt-token',
        user: {
          id: faker.string.uuid(),
          email: dto.email,
          name: dto.name,
        },
      };

      mockAuthService.register.mockResolvedValue(mockResult);

      const result = await controller.register(dto);

      expect(authService.register).toHaveBeenCalledWith(
        dto.email,
        dto.password,
        dto.name,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('login', () => {
    it('should call AuthService.login and return result', async () => {
      const dto = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      const mockResult = {
        access_token: 'jwt-token',
        user: {
          id: faker.string.uuid(),
          email: dto.email,
        },
      };

      mockAuthService.login.mockResolvedValue(mockResult);

      const result = await controller.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto.email, dto.password);
      expect(result).toEqual(mockResult);
    });
  });
});
