import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { User } from 'src/utils/user.decorator';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@User() user, @Body() createCommentDto: CreateCommentDto) {
    console.log(user);
    return this.commentsService.create(+user.id, createCommentDto);
  }

  @Get(':post_id')
  findAll(@Param('post_id') post_id, @Query() query) {
    return this.commentsService.findAll(+post_id, +query.page, +query.per_page);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentsService.update(+id, updateCommentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commentsService.remove(+id);
  }

  @Get('nbrCommentsOfUser/:id')
  nbrPostsOfUser(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.nbrCommentsOfUser(id);
  }
}
