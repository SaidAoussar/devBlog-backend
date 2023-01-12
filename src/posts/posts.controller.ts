import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  Patch,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { v4 as uuidv4 } from 'uuid';
import { diskStorage } from 'multer';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

import { User } from '../utils/user.decorator';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  findAll(@Query() query) {
    return this.postsService.findAll(
      +query.page,
      +query.per_page,
      query.q,
      +query.author,
    );
  }

  @Get('user/:id')
  findAllByAuthor(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.postsService.findAllByAuthor(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.postsService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @UseInterceptors(
    FileInterceptor('cover', {
      storage: diskStorage({
        destination: './post-cover',
        filename: (req, file, cb) => {
          const extention = file.originalname.split('.').pop();
          cb(null, `${uuidv4()}.${extention}`);
        },
      }),
    }),
  )
  create(
    @UploadedFile() cover: Express.Multer.File,
    @User() user,
    @Body() createPostDto: CreatePostDto,
  ) {
    return this.postsService.create(+user.id, {
      ...createPostDto,
      cover: cover?.filename || null,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @User() user,
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    console.log(updatePostDto);
    return this.postsService.update(id, user.id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.remove(id);
  }

  @Get('nbrPostsOfUser/:id')
  nbrPostsOfUser(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.nbrPostsOfUser(id);
  }
}
