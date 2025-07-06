import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from '../auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should validate user with correct credentials', async () => {
      const email = faker.internet.email();
      const password = faker.internet.password();
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = { id: faker.string.uuid(), email, password: hashedPassword };
      mockPrisma.user.findUnique.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await service.validateUser(email, password);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result).toEqual(user);
    });

    it('should throw if user not found', async () => {
      const email = faker.internet.email();
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.validateUser(email, 'any')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw if password does not match', async () => {
      const email = faker.internet.email();
      const user = { email, password: 'hashed_pw' };
      mockPrisma.user.findUnique.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(service.validateUser(email, 'wrongpw')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('login', () => {
    it('should return token and user if credentials are valid', async () => {
      const email = faker.internet.email();
      const password = faker.internet.password();
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = { id: faker.string.uuid(), email, password: hashedPassword };

      mockPrisma.user.findUnique.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login(email, password);

      expect(result).toEqual({
        access_token: 'jwt-token',
        user,
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
      });
    });

    it('should throw if credentials are invalid', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login('invalid@email.com', 'bad')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('register', () => {
    it('should create a new user and return token', async () => {
      const email = faker.internet.email();
      const password = faker.internet.password();
      const name = faker.person.fullName();
      const hashedPassword = await bcrypt.hash(password, 10);

      const createdUser = {
        id: faker.string.uuid(),
        email,
        password: hashedPassword,
        name,
      };

      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword);
      mockPrisma.user.create.mockResolvedValue(createdUser);
      mockPrisma.user.findUnique.mockResolvedValue(createdUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('new-token');

      const result = await service.register(email, password, name);

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: { email, password: hashedPassword, name },
      });

      expect(result).toEqual({
        access_token: 'new-token',
        user: createdUser,
      });
    });
  });
});
