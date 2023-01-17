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
import { PrismaService } from 'src/prisma/prisma.service';
import { access, unlinkSync } from 'fs';

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
      +query.tag_id,
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

  @Get('slug/:slug')
  findOneBySlug(@Param('slug') slug: string): Promise<any> {
    return this.postsService.findOneBySlug(slug);
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
  @Patch(':slug')
  @UseInterceptors(
    FileInterceptor('cover', {
      storage: diskStorage({
        destination: './post-cover',
        filename: async (req, file, cb) => {
          const extention = file.originalname.split('.').pop();
          const prismaService = new PrismaService();

          const post = await prismaService.post.findUnique({
            where: {
              slug: req.params.slug,
            },
          });
          if (!post?.cover) {
            cb(null, `${uuidv4()}.${extention}`);
          } else {
            access(`post-cover/${post?.cover}`, (err) => {
              if (err) {
                console.error(err);
                return;
              }
              unlinkSync('post-cover/' + post.cover);
            });
            cb(null, `${uuidv4()}.${extention}`);
          }
        },
      }),
    }),
  )
  update(
    @UploadedFile() cover: Express.Multer.File,
    @User() user,
    @Param('slug') slug: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    console.log({
      cover: cover?.filename || null,
    });
    return this.postsService.update(slug, user.id, {
      ...updatePostDto,
      cover: cover?.filename || null,
    });
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.remove(id);
  }

  @Get('nbr-posts-user/:id')
  nbrPostsOfUser(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.nbrPostsOfUser(id);
  }

  @Get('nbr-posts-tag/:id')
  nbrPostsOfTag(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.nbrPostsByTag(id);
  }
}
