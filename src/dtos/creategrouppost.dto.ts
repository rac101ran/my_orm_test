import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class GroupPostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNumber()
  @IsNotEmpty()
  groupId: number;
}

export class UpdateGroupPost {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsArray()
  categoryIds: number[];
}
