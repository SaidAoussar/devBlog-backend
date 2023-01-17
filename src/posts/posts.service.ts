import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Express } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import slugify from 'slugify';
import randomstring = require('randomstring');

@Injectable()
export class PostsService {
  constructor(readonly prisma: PrismaService) {}

  async create(authorId: number, createPostDto: CreatePostDto) {
    const { published, title, tags } = createPostDto;

    let slug = slugify(title, { lower: true });
    const existPostSameSlug = await this.prisma.post.findFirst({
      where: {
        slug,
      },
    });

    if (existPostSameSlug) {
      slug = await this.generateUniqueSlug(title);
    }

    const data = {
      ...createPostDto,
      slug,
      authorId,
      tags: {
        create:
          tags?.map((tagId) => {
            const id: number = parseInt(tagId);
            console.log('tag id', typeof id);

            return {
              tag: {
                connect: {
                  id,
                },
              },
            };
          }) || [],
      },
    };
    // check if post published to add date published at
    if (published) {
      data['publishedAt'] = new Date();
    }

    try {
      const result = await this.prisma.post.create({
        data,
      });
      return result;
    } catch (error) {
      console.log(error);
      if (error.code === 'P2003') {
        console.log(
          'Foreign key constraint failed on the field' + error.meta.field_name,
        );
        return error;
      }
    }
  }

  async findAll(
    page: number,
    per_page: number,
    q: string,
    author: number,
    tag_id: number,
  ) {
    if (isNaN(page)) {
      page = 1;
    }

    if (isNaN(per_page)) {
      per_page = 10;
    }

    let where: any = {
      AND: [{ published: true }],
    };

    if (q) {
      where = {
        ...where,
        OR: [
          { content: { contains: q, mode: 'insensitive' } },
          { title: { contains: q, mode: 'insensitive' } },
        ],
      };
    }

    if (author) {
      where = {
        ...where,
        AND: [...where.AND, { authorId: author }],
      };
    }

    if (tag_id) {
      where = {
        ...where,
        AND: [
          ...where.AND,
          {
            tags: {
              some: { tagId: tag_id },
            },
          },
        ],
      };
    }

    const total_count = await this.prisma.post.count({
      where,
    });

    // we check if total page less then page (page user enter). if is true we return {},
    if (Math.ceil(total_count / per_page) < page || page < 1) {
      return {};
    }

    const records: any = await this.prisma.post.findMany({
      skip: per_page * (page - 1),
      take: per_page,
      where,
      include: {
        author: true,
        tags: { include: { tag: true } },
      },
      orderBy: [{ createdAt: 'desc' }],
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

  async findAllByAuthor(id: number) {
    const posts = await this.prisma.post.findMany({
      where: { authorId: id },
    });

    return posts;
  }

  async findOne(id: number) {
    // Modeling and querying many-to-many relations
    const posts = await this.prisma.post.findUnique({
      where: {
        id,
      },
      include: {
        author: true,
        tags: { include: { tag: true } }, // Return all fields
        _count: {
          select: {
            comments: true,
            reactions: true,
          },
        },
      },
    });

    return {
      ...posts,
      tags: posts.tags.map((t) => t.tag),
    };
  }

  async update(slug: string, userId: number, updatePostDto: UpdatePostDto) {
    const { tags, ...data } = updatePostDto;

    /**
     * update tags:
     * we recive from request fields tags include tags that author want to be the tags of
     * his post.
     *  - if he send empty array means no tags attach to post we should delete all tags
     * exist in post.
     * -if he send array with value (id) means this ids is the tags that he want to attach
     * to post.
     * example : [1,3] => this tags we recive this tags want user to be tags of post.
     * author example this how this code work :
     * - we recive array of ids tag (tags) => [1, 3]
     * - the post have tags already (existTags) => [1,2,3]
     * - now we decide what tags delete what tags add.
     * - delete ids => [1,2,3] - [1,3] = [2]
     * - add ids => [1,3] - [1,2,3] = []
     */
    const { id } = await this.prisma.post.findFirst({
      where: {
        slug,
      },
    });

    if (tags) {
      const existTags = await this.prisma.tagsOnPosts.findMany({
        where: {
          postId: id,
        },
      });
      const formatExistTags = existTags.map((tag) => tag.tagId);

      const deleteTags = formatExistTags.filter(
        (tag) => !tags.includes(tag.toString()),
      );
      const newTags = tags.filter((tag) => !formatExistTags.includes(+tag));
      console.log('new : ', newTags);

      const deletedTagsOfPost = await this.prisma.tagsOnPosts.deleteMany({
        where: {
          postId: id,
          tagId: { in: deleteTags },
        },
      });

      const addTagsToPost = await this.prisma.tagsOnPosts.createMany({
        data: newTags.map((tag) => ({
          postId: id,
          tagId: +tag,
        })),
      });
    }

    return await this.prisma.post.update({
      where: {
        id,
      },
      data,
    });
  }

  async findOneBySlug(slug: string) {
    const post = await this.prisma.post.findUnique({
      where: {
        slug,
      },
      include: {
        tags: true,
      },
    });

    if (post) {
      return post;
    } else {
      throw new HttpException(
        'no post match this slug',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  remove(id: number) {
    return this.prisma.post.delete({
      where: {
        id,
      },
    });
  }

  async nbrPostsOfUser(id: number) {
    const nbrPosts = await this.prisma.post.count({
      where: {
        authorId: id,
        published: true,
      },
    });

    return { nbrPosts };
  }

  async nbrPostsByTag(id: number) {
    const nbrPosts = await this.prisma.post.count({
      where: {
        tags: {
          some: { tagId: id },
        },
        published: true,
      },
    });

    return { nbrPosts };
  }

  async generateUniqueSlug(title) {
    const randomStr = randomstring.generate({
      length: 7,
      charset: 'alphabetic',
    });
    let slug = slugify(title, { lower: true }) + '-' + randomStr;

    try {
      const existSlug = await this.prisma.post.findFirst({
        where: {
          slug: slug,
        },
      });
      return existSlug ? await this.generateUniqueSlug(title) : slug;
    } catch (error) {
      console.log(error);
    }
  }
}
