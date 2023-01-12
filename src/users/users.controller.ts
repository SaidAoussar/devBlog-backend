import {
  Controller,
  Param,
  ParseIntPipe,
  Get,
  Patch,
  UseInterceptors,
  UploadedFile,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { Express } from 'express';
import { diskStorage } from 'multer';
import { access, unlinkSync } from 'fs';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '../utils/user.decorator';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query() query) {
    return this.usersService.findAll(+query.page, +query.per_page, query.q);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.usersService.findOne(id);
  }

  @Patch('update-password')
  @UseGuards(AuthGuard('jwt'))
  updatePassword(@User() user, @Body() updatePasswordDto: UpdatePasswordDto) {
    return this.usersService.setNewPassword(+user.id, updatePasswordDto);
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('img', {
      storage: diskStorage({
        destination: './uploads',
        filename: async (req, file, cb) => {
          console.log(file);
          const prismaService = new PrismaService();
          const userService = new UsersService(prismaService);
          console.log('req.params', +req.params.id);
          const user = await userService.findImgNameById(+req.params.id);

          const extention = file.originalname.split('.').pop();
          const newNameImgUser = `${user.id}.${extention}`;
          access('uploads/' + user.img, (err) => {
            if (err) {
              //console.error(err);
              return;
            }

            if (user.img !== newNameImgUser) unlinkSync('uploads/' + user.img);
          });

          cb(null, newNameImgUser);
        },
      }),
    }),
  )
  update(
    @UploadedFile() img: Express.Multer.File,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    let data = updateUserDto;

    if (img?.filename) {
      data = { ...updateUserDto, img: img.filename };
    }

    return this.usersService.update(id, data);
  }
}

/*
the problem i found here : 
Order matters here, @Get('/vorgesetzter') should be implemented before @Get(':id'). With that request you are calling this.benutzerService.findBenutzerByID(id); with the following string: vorgesetzter?istVorgesetzter=true receiving the error you describe.

This is how express is implemented and NestJS follows the same behaviour: expressjs/express#2235, nestjs/nest#995


*/
