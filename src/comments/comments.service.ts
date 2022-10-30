import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}
  create(createCommentDto: CreateCommentDto) {
    let data = { ...createCommentDto };
    if (createCommentDto?.published) {
      data['publishedAt'] = new Date();
    }
    return this.prisma.comment.create({
      data,
    });
  }

  findAll() {
    return this.prisma.comment.findMany();
  }

  findOne(id: number) {
    return this.prisma.comment.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: number, updateCommentDto: UpdateCommentDto) {
    let data = updateCommentDto;
    if (updateCommentDto?.published) {
      const comment = await this.findOne(id);
      if (comment.publishedAt === null) {
        data['publishedAt'] = new Date();
      }
    }
    return this.prisma.comment.update({
      where: {
        id,
      },
      data,
    });
  }

  remove(id: number) {
    return this.prisma.comment.delete({
      where: {
        id,
      },
    });
  }
}
