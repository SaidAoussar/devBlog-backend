import {
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { MailerService } from '@nestjs-modules/mailer';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private authService: AuthService,
    private mailService: MailerService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
