import { IsBoolean, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreatePostViewDto {
  @IsUUID()
  postId: string;

  @IsOptional()
  @IsString()
  viewerId?: string; // userId for logged users, guest-{uuid} for anonymous users

  @IsOptional()
  @IsNumber()
  viewDuration?: number;

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}
