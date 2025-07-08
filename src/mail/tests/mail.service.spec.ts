import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from '@nestjs-modules/mailer';
import { MailService } from '../mail.service';

describe('MailService', () => {
  let service: MailService;
  let mailerService: MailerService;

  const mockMailerService = {
    sendMail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: MailerService, useValue: mockMailerService },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    mailerService = module.get<MailerService>(MailerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should send welcome email', async () => {
    mockMailerService.sendMail.mockResolvedValueOnce(true);

    await service.sendWelcomeEmail('user@example.com', 'John');

    expect(mailerService.sendMail).toHaveBeenCalledWith({
      to: 'user@example.com',
      subject: 'Welcome to our platform!',
      template: './welcome',
      context: { name: 'John' },
    });
  });

  it('should send welcome-here email', async () => {
    mockMailerService.sendMail.mockResolvedValueOnce(true);

    await service.sendWelcomeHereEmail('user@example.com', 'Alice');

    expect(mailerService.sendMail).toHaveBeenCalledWith({
      to: 'user@example.com',
      subject: 'Welcome to our platform!',
      template: './welcome-here',
      context: { name: 'Alice' },
    });
  });

  it('should send document-shared email', async () => {
    mockMailerService.sendMail.mockResolvedValueOnce(true);

    await service.sendDocumentSharedEmail(
      'b@example.com',
      'Bob',
      'Alice',
      'Project Plan',
      'https://example.com/documents/123',
    );

    expect(mailerService.sendMail).toHaveBeenCalledWith({
      to: 'b@example.com',
      subject: 'Dokument "Project Plan" bol s tebou zdieľaný',
      template: './document-shared',
      context: {
        recipientName: 'Bob',
        senderName: 'Alice',
        documentTitle: 'Project Plan',
        documentLink: 'https://example.com/documents/123',
      },
    });
  });
});
