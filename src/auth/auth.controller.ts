import {
  Controller,
  Request,
  Post,
  UseGuards,
  Body,
  Get,
  Param,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('/login')
  login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('/register')
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.authService.register(createUserDto);
  }

  @Get('/activate_account/:token')
  activateAccount(@Param('token') token: string): Promise<any> {
    return this.authService.activateAccount(token);
  }

  @Get('/forgot-password/:email')
  forgotPassword(@Param('email') email: string): Promise<any> {
    return this.authService.forgotPassword(email);
  }

  @Post('/change-password/:token')
  changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Param('token') token: string,
  ) {
    return this.authService.changePassword(changePasswordDto, token);
  }
}
