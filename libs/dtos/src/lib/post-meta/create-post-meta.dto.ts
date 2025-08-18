import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreatePostMetaDto {
  @IsUUID()
  @ApiProperty()
  postId: string;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty()
  metaId: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  value?: string;
}

export class CreatePostMetaNestedDto {
  @IsUUID()
  @IsNotEmpty()
  metaId: string;

  @IsOptional()
  @IsString()
  value?: string;
}
