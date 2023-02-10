import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}
  create(createTagDto: CreateTagDto) {
    return this.prisma.tag.create({
      data: createTagDto,
    });
  }

  async findAll(paginate: string, page: number, per_page: number, q: string) {
    if (paginate === 'false') {
      return this.prisma.tag.findMany();
    }
    if (isNaN(page)) {
      page = 1;
    }

    if (isNaN(per_page)) {
      per_page = 10;
    }

    let where = {};

    if (q) {
      where = {
        name: { contains: q, mode: 'insensitive' },
      };
    }

    const total_count = await this.prisma.tag.count({
      where,
    });

    if (Math.ceil(total_count / per_page) < page || page < 1) {
      return {
        records: [],
      };
    }

    const records = await this.prisma.tag.findMany({
      skip: per_page * (page - 1),
      take: per_page,
      where,
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: {
        posts: { _count: 'desc' },
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
    return this.prisma.tag.findUnique({
      where: {
        id,
      },
    });
  }

  update(id: number, updateTagDto: UpdateTagDto) {
    return this.prisma.tag.update({
      where: {
        id,
      },
      data: updateTagDto,
    });
  }

  remove(id: number) {
    return this.prisma.tag.delete({
      where: { id },
    });
  }
}
