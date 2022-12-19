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
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../utils/user.decorator';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  findAll(@Query() query) {
    return this.postsService.findAll(+query.page, +query.per_page);
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
  create(@User() user, @Body() createPostDto: CreatePostDto) {
    return this.postsService.create(+user.id, createPostDto);
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
}
