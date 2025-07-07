import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { faker } from '@faker-js/faker';

describe('UserController', () => {
  let controller: UserController;

  class MockJwtAuthGuard {
    canActivate(context: ExecutionContext) {
      const req = context.switchToHttp().getRequest();
      req.user = mockUser;
      return true;
    }
  }

  const mockUser = {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [Reflector],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(MockJwtAuthGuard)
      .compile();

    controller = module.get<UserController>(UserController);
  });

  it('should return current user profile', () => {
    const req = { user: mockUser };
    const result = controller.getProfile(req);
    expect(result).toEqual(mockUser);
  });
});
