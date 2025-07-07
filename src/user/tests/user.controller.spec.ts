import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { faker } from '@faker-js/faker';
import { UserService } from '../user.service'; // Uprav cestu podľa potreby

describe('UserController', () => {
  let controller: UserController;

  const mockUser = {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
  };

  const mockUserService = {
    // V prípade potreby pridaj ďalšie mock metódy
    findById: jest.fn().mockResolvedValue(mockUser),
  };

  class MockJwtAuthGuard {
    canActivate(context: ExecutionContext) {
      const req = context.switchToHttp().getRequest();
      req.user = mockUser;
      return true;
    }
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        Reflector,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(MockJwtAuthGuard)
      .compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return current user profile', () => {
    const req = { user: mockUser };
    const result = controller.getProfile(req);
    expect(result).toEqual(mockUser);
  });
});
