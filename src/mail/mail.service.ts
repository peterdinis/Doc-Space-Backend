import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) { }

  async sendWelcomeEmail(to: string, name: string) {
    await this.mailerService.sendMail({
      to,
      subject: 'Welcome to our platform!',
      template: './welcome',
      context: {
        name,
      },
    });
  }

  async sendWelcomeHereEmail(to: string, name: string) {
    await this.mailerService.sendMail({
      to,
      subject: 'Welcome to our platform!',
      template: './welcome-here',
      context: { name },
    });
  }

  async sendDocumentSharedEmail(
    recipientEmail: string,
    recipientName: string,
    senderName: string,
    documentTitle: string,
    documentLink: string,
  ) {
    await this.mailerService.sendMail({
      to: recipientEmail,
      subject: `Dokument "${documentTitle}" bol s tebou zdieľaný`,
      template: './document-shared',
      context: {
        recipientName,
        senderName,
        documentTitle,
        documentLink,
      },
    });
  }
}
