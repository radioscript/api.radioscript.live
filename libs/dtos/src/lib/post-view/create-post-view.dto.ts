import { IsBoolean, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreatePostViewDto {
  @IsUUID()
  postId: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsNumber()
  viewDuration?: number;

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}
