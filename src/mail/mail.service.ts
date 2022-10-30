import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendEmail(to, subject, html) {
    return await this.mailerService.sendMail({
      to,
      from: 'aoussarsaid33@gmail.com',
      subject,
      html,
    });
  }
}
