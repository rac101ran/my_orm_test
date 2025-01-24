import {
  Injectable,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async updateFollowRequest(followerId: number, followingId: number) {
    try {
      const connection = await this.prisma.connection.findFirst({
        where: {
          followerId,
          followingId,
        },
        select: {
          id: true,
        },
      });
      if (connection) {
        await this.prisma.connection.delete({
          where: {
            id: connection.id,
          },
        });
      } else {
        await this.prisma.connection.create({
          data: {
            followerId: followerId,
            followingId: followingId,
          },
        });
      }
      return {
        status: HttpStatus.OK,
        message: `connection updated for: ${followerId}`,
      };
    } catch (error) {
      throw error;
    }
  }

  async addCommentOnPost(postId: number, userId: number, content: string) {
    try {
      const addComment = await this.prisma.comments.create({
        data: {
          content: content,
          userId: userId,
          postId: postId,
        },
      });
      return addComment;
    } catch (error) {
      throw error;
    }
  }
  async getCommentsOfPosts(postId: number) {
    const commentsData = await this.prisma.comments.findMany({
      where: {
        postId: postId,
      },
      select: {
        content: true,
        user: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    return {
      data: {
        commentsCount: commentsData.length,
        commentsData,
      },
      status: HttpStatus.OK,
    };
  }
  async updateLike(postId: number, userId: number) {
    try {
      const updateLike = await this.prisma.likes.findFirst({
        where: {
          postId: postId,
          userId: userId,
        },
        select: {
          id: true,
        },
      });

      let like: boolean = true;

      if (updateLike) {
        await this.prisma.likes.delete({
          where: {
            id: updateLike.id,
          },
        });
        like = false;
      } else {
        await this.prisma.likes.create({
          data: {
            userId: userId,
            postId: postId,
          },
          select: {
            id: true,
          },
        });
      }
      return {
        status: HttpStatus.OK,
        message: 'Like request updated',
        data: {
          like,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async listLikesOnPost(postId: number) {
    try {
      const likes = await this.prisma.likes.findMany({
        where: {
          postId: postId,
        },
        select: {
          user: {
            select: {
              email: true,
            },
          },
        },
      });
      return likes;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
