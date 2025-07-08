import { Test, TestingModule } from '@nestjs/testing';
import { MailController } from '../mail.controller';
import { MailService } from '../mail.service';

describe('MailController', () => {
  let controller: MailController;
  let mailService: MailService;

  const mockMailService = {
    sendWelcomeEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MailController],
      providers: [{ provide: MailService, useValue: mockMailService }],
    }).compile();

    controller = module.get<MailController>(MailController);
    mailService = module.get<MailService>(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('testSend', () => {
    it('should call sendWelcomeEmail with correct params and return result', async () => {
      mockMailService.sendWelcomeEmail.mockResolvedValue('email sent');

      const result = await controller.testSend('test@example.com');

      expect(mailService.sendWelcomeEmail).toHaveBeenCalledWith(
        'test@example.com',
        'John Doe',
      );
      expect(result).toBe('email sent');
    });
  });
});
