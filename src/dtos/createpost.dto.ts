import { IsArray, IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsBoolean()
  published: boolean;
}
export class ListOfPostsCreate {
  @IsArray()
  @IsNotEmpty()
  posts: CreatePostDto[];
}
