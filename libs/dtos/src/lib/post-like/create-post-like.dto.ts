import { IsUUID } from 'class-validator';

export class CreatePostLikeDto {
  @IsUUID()
  postId: string;
}
