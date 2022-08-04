import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(readonly prisma: PrismaService) {}

  create(createPostDto: CreatePostDto) {
    const { published, title } = createPostDto;

    const slug = title.split(' ').join('-');

    let data = {
      ...createPostDto,
      slug,
      author: {
        connect: { id: 2 },
      },
    };
    // check if post published to add date published at
    if (published) {
      data['publishedAt'] = new Date();
    }

    return this.prisma.post.create({
      data,
    });
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
    return this.prisma.post.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    const data = updatePostDto;

    if (updatePostDto?.title) {
      data['slug'] = updatePostDto?.title.split(' ').join('-');
    }

    if (updatePostDto?.published) {
      const post = await this.prisma.post.findUnique({
        where: { id },
      });

      if (post.publishedAt === null) {
        data['publishedAt'] = new Date();
      }
    }

    return this.prisma.post.update({
      where: {
        id,
      },
      data,
    });
  }

  remove(id: number) {
    return this.prisma.post.delete({
      where: {
        id,
      },
    });
  }
}
