import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(readonly prisma: PrismaService) {}

  async create(authorId: number, createPostDto: CreatePostDto) {
    const { published, title, tags } = createPostDto;

    const slug = title.split(' ').join('-');

    const data = {
      ...createPostDto,
      slug,
      authorId,
      tags: {
        create:
          tags?.map((tagId) => ({
            tag: {
              connect: {
                id: tagId,
              },
            },
          })) || [],
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

  async findAll(page: number, per_page: number) {
    if (isNaN(page)) {
      page = 1;
    }

    if (isNaN(per_page)) {
      per_page = 10;
    }

    const where = {
      published: true,
    };

    const total_count = await this.prisma.post.count({
      where,
    });

    // we check if total page less then page (page user enter). if is true we return {},
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
        category: true,
      },
    });

    return {
      ...posts,
      tags: posts.tags.map((tags) => tags.tag),
    };
  }

  async update(id: number, authorId: number, updatePostDto: UpdatePostDto) {
    const { tags, ...data } = updatePostDto;

    // if categoryId = -1 means we remove category from post
    if (data.categoryId === -1) {
      data.categoryId = null;
    }

    /**
     * if title exist in request we should update slug too
     */
    if (updatePostDto?.title) {
      data['slug'] = updatePostDto?.title.split(' ').join('-');
    }

    /**
     * if published field exist in request and is true . we check if field publishedAt is
     * null,if it is null we change it to now date.
     */
    if (updatePostDto?.published) {
      const post = await this.prisma.post.findUnique({
        where: { id },
      });

      if (post.publishedAt === null) {
        data['publishedAt'] = new Date();
      }
    }
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
    if (tags) {
      const existTags = await this.prisma.tagsOnPosts.findMany({
        where: {
          postId: id,
        },
      });
      const formatExistTags = existTags.map((tag) => tag.tagId);

      const deleteTags = formatExistTags.filter((tag) => !tags.includes(tag));
      console.log('delete', deleteTags);
      const newTags = tags.filter((tag) => !formatExistTags.includes(tag));
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
          tagId: tag,
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

  remove(id: number) {
    return this.prisma.post.delete({
      where: {
        id,
      },
    });
  }
}
