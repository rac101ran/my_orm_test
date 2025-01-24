import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AppService } from './app.service';
import { CreateUserDto } from './dtos/creatuser.dto';
import { CreatePostDto, ListOfPostsCreate } from './dtos/createpost.dto';
import { CreateCategoryDto } from './dtos/createcategory.dto';
import { GroupPostDto, UpdateGroupPost } from './dtos/creategrouppost.dto';
import { ProfileService } from './profile.service';

@Controller('main')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly profileService: ProfileService,
  ) {}

  @Get('user/:id')
  getUser(
    @Param('id', ParseIntPipe) id: number,
    @Query('take', ParseIntPipe) take: number,
    @Query('skip', ParseIntPipe) skip: number,
  ) {
    return this.appService.getUserById(id, take, skip);
  }

  @Post('user')
  @UsePipes(ValidationPipe)
  signUpUsers(@Body() body: CreateUserDto) {
    return this.appService.createUsers(body);
  }

  @Post(':id/post')
  @UsePipes(ValidationPipe)
  createPost(
    @Body() body: { post: CreatePostDto; categories: number[] },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.appService.createPostForUser(body.post, id, body.categories);
  }

  @Post(':id/posts')
  @UsePipes(ValidationPipe)
  createMultiplePosts(
    @Body() body: ListOfPostsCreate,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.appService.createMultiplePosts(body.posts, id);
  }

  @Post('category')
  @UsePipes(ValidationPipe)
  createCategories(@Body() body: CreateCategoryDto) {
    return this.appService.createCategoriesService(body);
  }

  @Put(':id/post')
  @UsePipes(ValidationPipe)
  updatePostWithCategories(@Body() body: { ids: number[]; postId: number }) {
    return this.appService.updatePostWithCategories(body.postId, body.ids);
  }

  @Post('user/:id/group')
  @UsePipes(ValidationPipe)
  createGroupWithUsers(
    @Body() body: { users: number[] },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.appService.createGroup(body.users, id);
  }
  @Post('user/:id/group/post')
  @UsePipes(ValidationPipe)
  createGroupPost(
    @Body() body: GroupPostDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.appService.createGroupPost(id, body);
  }
  @Put('user/:id/group/post/:pid/')
  @UsePipes(ValidationPipe)
  updateGroupPost(
    @Body() body: UpdateGroupPost,
    @Param('id', ParseIntPipe) id: number,
    @Param('pid', ParseIntPipe) pid: number,
  ) {
    return this.appService.updateGroupService(body, id, pid);
  }

  @Get('wall')
  getGlobalPost() {
    return this.appService.getGlobalWallPosts();
  }

  @Get('profile/:authorId')
  async getAllPosts(@Param('authorId', ParseIntPipe) authorId: number) {
    return this.appService.getAllPostsFromProfile(authorId);
  }

  @Put('follow_request/:userId')
  async followRequestUpdate(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() body: { followingId: number },
  ) {
    return await this.profileService.updateFollowRequest(
      userId,
      body.followingId,
    );
  }

  @Post('posts/:postId/comments/:userId')
  async addCommentOnPostByUser(
    @Param('postId', ParseIntPipe) postId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body()
    body: {
      content: string;
    },
  ) {
    return await this.profileService.addCommentOnPost(
      postId,
      userId,
      body.content,
    );
  }

  @Get('posts/:postId/comments')
  async getCommentsForPosts(@Param('postId', ParseIntPipe) postId: number) {
    return await this.profileService.getCommentsOfPosts(postId);
  }

  @Put('posts/:postId/likes/:userId')
  async updateLikeInPost(
    @Param('postId', ParseIntPipe) postId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return await this.profileService.updateLike(postId, userId);
  }

  @Get('posts/:postId/likes')
  async getPostLikes(@Param('postId', ParseIntPipe) postId: number) {
    return await this.profileService.listLikesOnPost(postId);
  }
}
