import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/utils/user.decorator';
import { PostReactionsService } from './post-reactions.service';

@Controller('post-reactions')
export class PostReactionsController {
  constructor(private readonly postReactionsService: PostReactionsService) {}
  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@User() user, @Body() body) {
    return this.postReactionsService.create(+user.id, +body.postId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('check')
  check(@User() user, @Body() body) {
    return this.postReactionsService.check(+user.id, body.postId);
  }

  @Get(':postId')
  nbrReactionsByPost(@Param('postId', ParseIntPipe) postId: number) {
    return this.postReactionsService.nbrReactionsByPost(postId);
  }
}
