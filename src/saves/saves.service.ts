import { Get, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from 'src/utils/user.decorator';

@Injectable()
export class SavesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, postId: number) {
    if (isNaN(userId)) {
      throw new HttpException('userId is undefined', HttpStatus.BAD_REQUEST);
    }

    if (isNaN(postId)) {
      throw new HttpException('postId is undefined', HttpStatus.BAD_REQUEST);
    }

    const save = await this.prisma.save.findFirst({
      where: {
        userId,
        postId,
      },
    });

    if (save) {
      return await this.prisma.save.delete({
        where: {
          id: save.id,
        },
      });
    } else {
      return await this.prisma.save.create({
        data: {
          userId,
          postId,
        },
      });
    }
  }

  async findAll(userId: number, tagId: number, q: string) {
    let where: any = {
      userId,
    };

    if (q) {
      console.log('q :', q);

      where = {
        ...where,
        post: {
          ...where.post,
          title: { contains: q, mode: 'insensitive' },
        },
      };
    }
    if (tagId) {
      if (typeof tagId == 'number') {
        where = {
          ...where,
          post: {
            ...where.post,
            tags: { some: { tagId: tagId } },
          },
        };
      }
    }
    const saves = await this.prisma.save.findMany({
      where,
      select: {
        id: true,
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
            createdAt: true,
            author: {
              select: {
                firstName: true,
                lastName: true,
                username: true,
                img: true,
              },
            },
            tags: {
              select: { tag: true },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const posts = saves.map((save) => ({
      ...save.post,
      saveId: save.id,
    }));

    return posts;
  }
  /**
   * check if auth user saved post
   *
   * note: if postId="" it well be convert to 0 because Number("")=0
   */
  async check(userId: number, postId: number) {
    if (isNaN(userId)) {
      throw new HttpException('userId is undefined', HttpStatus.BAD_REQUEST);
    }

    if (isNaN(postId)) {
      throw new HttpException('postId is undefined', HttpStatus.BAD_REQUEST);
    }

    const saved = await this.prisma.save.findFirst({
      where: {
        userId: userId,
        postId: postId,
      },
    });

    if (saved) {
      return { saved: true };
    } else {
      return { saved: false };
    }
  }

  async nbrSavesByPost(postId: number) {
    return await this.prisma.save.count({
      where: {
        postId,
      },
    });
  }

  async findAllTagsOfSaves(userId: number) {
    const result = await this.prisma
      .$queryRaw`SELECT "Tag"."name",COUNT("Tag"."name")::int,"Tag"."id" FROM "Save" LEFT JOIN "TagsOnPosts" ON "TagsOnPosts"."postId"="Save"."postId" LEFT JOIN "Tag" ON "Tag"."id" = "TagsOnPosts"."tagId" WHERE "Save"."userId" = ${userId} GROUP BY "Tag"."name","Tag"."id"`;
    return result;
  }

  async remove(id: number) {
    return await this.prisma.save
      .delete({
        where: { id },
      })
      .catch((e) => {
        if (e.code === 'P2025') {
          throw new HttpException(
            'Record to delete does not exist.',
            HttpStatus.BAD_REQUEST,
          );
        }
      });
  }
}
