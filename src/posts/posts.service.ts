import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(readonly prisma: PrismaService) {}

  create(createPostDto: CreatePostDto) {
    return 'This action adds a new post';
  }

  async findAll(page: number, per_page: number) {
    if (isNaN(page)) {
      page = 1;
    }

    if (isNaN(per_page)) {
      per_page = 3;
    }

    const where = {
      published: true,
    };

    const total_count = await this.prisma.post.count({
      where,
    });

    if (Math.ceil(total_count / per_page) < page || page < 1) {
      return {};
    }

    const records = await this.prisma.post.findMany({
      skip: per_page * (page - 1),
      take: per_page,
      where,
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
    return `This action returns a #${id} post`;
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
