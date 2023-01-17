import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}
  create(id: number, createCommentDto: CreateCommentDto) {
    return this.prisma.comment.create({
      data: {
        ...createCommentDto,
        userId: id,
      },
    });
  }

  async findAll(post_id: number, page: number, per_page: number) {
    if (isNaN(page)) {
      page = 1;
    }
    if (isNaN(per_page)) {
      per_page = 10;
    }

    const where = {
      postId: post_id,
    };

    const total_count = await this.prisma.comment.count({
      where,
    });

    if (Math.ceil(total_count / per_page) < page || page < 1) {
      return {};
    }
    const records = await this.prisma.comment.findMany({
      skip: per_page * (page - 1),
      take: per_page,
      where,
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      _metadata: {
        page,
        per_page,
        total_count,
      },
      records,
    };
  }

  findOne(id: number) {
    return this.prisma.comment.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: number, updateCommentDto: UpdateCommentDto) {
    return this.prisma.comment.update({
      where: {
        id,
      },
      data: updateCommentDto,
    });
  }

  remove(id: number) {
    return this.prisma.comment.delete({
      where: {
        id,
      },
    });
  }

  async nbrCommentsOfUser(id: number) {
    const nbrComments = await this.prisma.comment.count({
      where: {
        userId: id,
      },
    });

    return { nbrComments };
  }
}
