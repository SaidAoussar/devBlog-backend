import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { MailService } from 'src/mail/mail.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

import { UsersService } from 'src/users/users.service';
import { ChangePasswordDto } from './dto/change-password.dto';

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
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(createUserDto: CreateUserDto) {
    const { id, email } = await this.usersService.create(createUserDto);
    const token = this.jwtService.sign(
      { email: email, sub: id },
      { expiresIn: '120s' },
    );

    await this.mailService.sendEmail(
      email,
      'Account activate link',
      `<h2>please clike on given link to activate your account<h2>
      <a href='http://localhost:3000/auth/activate_account/${token}'>link</a>`,
    );
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
      { expiresIn: '5m' },
    );

    await this.mailService.sendEmail(
      email,
      'forgot password',
      `<h2>please clik on given link to change your password<h2>
      <a href='http://localhost:3000/auth/change-password/${token}'>link</a>`,
    );
    return {
      message: 'success send email to user',
    };
  }

  async changePassword(
    changePasswordDto: ChangePasswordDto,
    token: string,
  ): Promise<any> {
    console.log(token);
    const verify = await this.jwtService.verify(token);
    if (!verify) {
      throw new BadRequestException('invalid token');
    }

    const user = await this.usersService.updatePassword(
      verify.sub,
      changePasswordDto.password,
    );

    console.log(user);

    if (!user) {
      throw new BadRequestException('id dont exist');
    }

    return {
      message: 'password is change with success',
    };
  }
}
