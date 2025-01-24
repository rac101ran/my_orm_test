import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Prisma } from '@prisma/client';
import { GroupPostDto, UpdateGroupPost } from './dtos/creategrouppost.dto';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  createUsers(userData: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data: userData });
  }

  async getUserById(id: number, take: number, skip: number) {
    return await this.prisma.user.findUnique({
      where: { id: id },
      select: {
        name: true,
        posts: {
          select: {
            title: true,
            content: true,
            published: true,
            PostCategory: {
              select: {
                category: true,
              },
              orderBy: {
                category: {
                  rank: 'asc',
                },
              },
            },
          },
          orderBy: {
            title: 'desc',
          },
          skip: skip,
          take: take,
        },
        GroupPost: {
          where: {
            ownerId: id,
          },
          take: take,
          skip: skip,
        },
      },
    });
  }

  async createPostForUser(
    post: Prisma.PostCreateInput,
    id: number,
    categoryIds: number[],
  ) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { id: id },
        select: { id: true },
      });

      if (!user) {
        throw new BadRequestException('user not found');
      }

      const postItem = await this.prisma.post.create({
        data: {
          title: post['title'],
          content: post['content'],
          published: post['published'],
          authorId: user.id,
          PostCategory: {
            create: categoryIds.map((categoryId) => ({
              category: {
                connect: {
                  id: categoryId,
                },
              },
            })),
          },
        },
        // here if you use select: u have to explicitly provide the fields from main table as well , but for include you just have to add the field you want from related tables, main is already added
        include: {
          PostCategory: {
            select: {
              category: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      return postItem;
    } catch (error) {
      throw error;
    }
  }

  async createMultiplePosts(posts: Prisma.PostCreateInput[], id: number) {
    try {
      const createMultiplePosts = await this.prisma.user.update({
        where: {
          id: id,
        },
        data: {
          posts: {
            createMany: {
              data: posts,
            },
          },
        },
      });
      return createMultiplePosts;
    } catch (error) {
      throw error;
    }
  }

  async createCategoriesService(categoryData: Prisma.CategoryCreateInput) {
    return this.prisma.category.create({ data: categoryData });
  }
  async updatePostWithCategories(postId: number, categoriesIds: number[]) {
    try {
      const postsUpdated = await this.prisma.post.update({
        where: {
          id: postId,
        },
        data: {
          PostCategory: {
            create: categoriesIds.map((categoriesIds) => ({
              category: {
                connect: {
                  id: categoriesIds,
                },
              },
            })),
          },
        },
      });
      return postsUpdated;
    } catch (error) {
      throw new error();
    }
  }

  async createGroup(users: number[], id: number) {
    try {
      const groupUser = await this.prisma.group.create({
        data: {
          users: {
            connect: users.map((userId) => ({
              id: userId,
            })),
          },
        },
        include: {
          users: true,
        },
      });
      return groupUser;
    } catch (error) {
      throw error;
    }
  }

  createGroupPost(id: number, groupPost: GroupPostDto) {
    try {
      const groupPostCreate = this.prisma.groupPost.create({
        data: {
          title: groupPost.title,
          content: groupPost.content,
          owner: {
            connect: {
              id: id,
            },
          },
          group: {
            connect: {
              id: groupPost.groupId,
            },
          },
        },
        select: {
          title: true,
          content: true,
          group: true,
          owner: true,
        },
      });
      return groupPostCreate;
    } catch (error) {
      throw error;
    }
  }

  async updateGroupService(
    groupPost: UpdateGroupPost,
    ownerId: number,
    postId: number,
  ) {
    try {
      const groupPostUpdate = await this.prisma.groupPost.update({
        where: {
          ownerId: ownerId,
          id: postId,
        },
        data: {
          title: groupPost.title,
          content: groupPost.content,
          categories: {
            connect: groupPost.categoryIds.map((category) => ({
              id: category,
            })),
          },
        },
        include: {
          categories: true,
        },
      });
      return groupPostUpdate;
    } catch (error) {
      throw error;
    }
  }

  async getGlobalWallPosts() {
    try {
      const posts = await this.prisma.post.findMany({
        select: {
          title: true,
          content: true,
          PostCategory: {
            select: {
              category: {
                select: {
                  rank: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      posts.sort((a, b) => {
        let categoriesRankCalcA = 0,
          categoriesRankCalcB = 0;
        for (let i = 0; i < a.PostCategory.length; i++) {
          categoriesRankCalcA += a.PostCategory[i].category.rank;
        }
        for (let i = 0; i < b.PostCategory.length; i++) {
          categoriesRankCalcB += b.PostCategory[i].category.rank;
        }
        return categoriesRankCalcA > categoriesRankCalcB ? 1 : -1;
      });

      const groupPosts = await this.prisma.groupPost.findMany({
        select: {
          title: true,
          content: true,
          categories: {
            select: {
              rank: true,
              name: true,
            },
          },
        },
      });

      groupPosts.sort((a, b) => {
        let categoriesRankCalcA = 0,
          categoriesRankCalcB = 0;
        for (let i = 0; i < a.categories.length; i++) {
          categoriesRankCalcA += a.categories[i].rank;
        }
        for (let i = 0; i < b.categories.length; i++) {
          categoriesRankCalcB += b.categories[i].rank;
        }
        return categoriesRankCalcA > categoriesRankCalcB ? 1 : -1;
      });

      const allPosts = new Array();

      for (let i = 0; i < posts.length; i++) {
        allPosts.push({
          title: posts[i].title,
          content: posts[i].content,
          categories: posts[i].PostCategory.map((c) => [c.category.name]),
        });
      }

      for (let i = 0; i < groupPosts.length; i++) {
        allPosts.push({
          title: groupPosts[i].title,
          content: groupPosts[i].content,
          categories: groupPosts[i].categories.map((c) => [c.name]),
        });
      }

      return {
        allPosts,
      };
    } catch (error) {
      throw error;
    }
  }
  async getAllPostsFromProfile(authorId: number) {
    try {
      const posts = await this.prisma.post.findMany({
        where: {
          authorId: authorId,
        },
        select: {
          title: true,
          content: true,
          published: true,
        },
      });
      const groupPosts = await this.prisma.groupPost.findMany({
        where: {
          group: {
            users: {
              some: {
                id: authorId,
              },
            },
          },
        },
      });
      return {
        posts,
        groupPosts,
      };
    } catch (error) {
      throw error;
    }
  }
}
