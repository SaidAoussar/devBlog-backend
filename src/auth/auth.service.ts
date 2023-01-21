import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { MailService } from 'src/mail/mail.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

import { UsersService } from 'src/users/users.service';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    const isMatch = await bcrypt.compare(password, user.password);

    if (user && isMatch) {
      const { password, active, ...result } = user;
      return result;
    }

    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      ...user,
      token: this.jwtService.sign(payload),
    };
  }

  async register(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    const token = this.jwtService.sign(
      { email: user.email, sub: user.id },
      { expiresIn: '7d' },
    );

    await this.mailService.sendEmail(
      user.email,
      'Account activate link',
      `<h2>please clike on given link to activate your account<h2>
      <a href='http://localhost:3000/auth/activate_account/${token}'>link</a>`,
    );

    return user;
  }

  async activateAccount(token: string): Promise<any> {
    const verify = await this.jwtService.verify(token);
    // exclude fields
    return this.usersService.active(verify.sub);
  }

  async forgotPassword(email: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('invalid Email');
    }
    const token = this.jwtService.sign(
      { email: user.email, sub: user.id },
      { expiresIn: '1d' },
    );

    const sendEmail = await this.mailService.sendEmail(
      email,
      'forgot password',
      `<div style="text-align:center;">
        <h2>Hi ${user.firstName} ${user.lastName},</h2>
        <p style="font-size:18px;">You recently requested to reset your password for your     <strong>devBlog</strong> account. Use the button below to reset it. <strong>This password reset is only valid for the next 24 hours</strong>.
        </p>
        <div style="">
          <a href='${process.env.FRONTEND_URL}/reset-password?token=${token}' style="display: inline-block;background-color: #22BC66;padding: 10px 18px; color:white;text-decoration:none;border-radius: 8px;;">Reset your pasword</a>
        </div>
      </div>
      `,
    );

    if (sendEmail.accepted[0] === user.email) {
      return {
        message: 'Your password reset instructions have been sent',
      };
    } else {
      throw new HttpException(
        'something go wrong try to send later',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<any> {
    try {
      const verify = await this.jwtService.verify(resetPasswordDto.token);

      const user = await this.usersService.updatePassword(
        verify.sub,
        resetPasswordDto.newPassword,
      );

      if (!user) {
        throw new HttpException('something wrong', HttpStatus.BAD_REQUEST);
      }

      return {
        message: 'password is reset with success.',
      };
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }

      if (error.name === 'TokenExpiredError') {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }
  }
}
