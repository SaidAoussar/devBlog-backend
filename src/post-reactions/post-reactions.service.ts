import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PostReactionsService {
  constructor(private readonly prisma: PrismaService) {}
  async create(userId: number, postId: number) {
    const reaction = await this.prisma.postReactions.findFirst({
      where: {
        postId,
        userId,
      },
    });
    if (reaction) {
      return await this.prisma.postReactions.delete({
        where: {
          id: reaction.id,
        },
      });
    } else {
      return await this.prisma.postReactions.create({
        data: {
          postId,
          userId,
        },
      });
    }
  }

  async nbrReactionsByPost(postId: number) {
    return await this.prisma.postReactions.count({
      where: {
        postId,
      },
    });
  }

  /**
   * check if user reacted to the post before
   */
  async check(userId: number, postId: number) {
    const reaction = await this.prisma.postReactions.findFirst({
      where: {
        userId,
        postId,
      },
    });

    if (reaction) {
      return { reacted: true };
    } else {
      return { reacted: false };
    }
  }
}
