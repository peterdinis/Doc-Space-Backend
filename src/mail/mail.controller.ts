import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MailService } from './mail.service';

@ApiTags('Mail')
@ApiBearerAuth()
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get('test')
  @ApiOperation({ summary: 'Send a test welcome email using Mailtrap' })
  @ApiQuery({
    name: 'email',
    type: String,
    required: true,
    description: 'Recipient email address',
    example: 'test@example.com',
  })
  @ApiResponse({
    status: 200,
    description: 'Test email sent successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request – invalid or missing email',
  })
  async testSend(@Query('email') email: string) {
    return this.mailService.sendWelcomeEmail(email, 'John Doe');
  }
}
