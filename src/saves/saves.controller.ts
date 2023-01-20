import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { query } from 'express';
import { User } from 'src/utils/user.decorator';
import { SavesService } from './saves.service';

@Controller('saves')
export class SavesController {
  constructor(private readonly savesService: SavesService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@User() user, @Body() body) {
    return this.savesService.create(+user.id, +body.post_id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('find-all-tags')
  findAllTags(@User() user) {
    return this.savesService.findAllTagsOfSaves(+user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('check')
  check(@User() user, @Query() query) {
    return this.savesService.check(+user.id, +query.post_id);
  }

  @Get(':postId')
  nbrSavesByPost(@Param('postId', ParseIntPipe) postId: number) {
    return this.savesService.nbrSavesByPost(postId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll(@User() user, @Query() query) {
    return this.savesService.findAll(+user.id, +query.tag_id, query.q);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.savesService.remove(id);
  }
}
