// src/posts/post.controller.ts
import { Permissions, Roles } from '@/decorators';
import { CreatePostDto, PostQueryDto, UpdatePostDto } from '@/dtos';
import { UserRole } from '@/enums';
import { JwtAuthGuard, RolesGuard } from '@/guards';
import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { Request } from 'express';
import { PostService } from './posts.service';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EDITOR)
  @Permissions('posts.create')
  @Post()
  create(@Req() req: Request, @Body() dto: CreatePostDto) {
    return this.postService.create(req, dto);
  }

  @Get()
  @Permissions('posts.read')
  findAll(@Query() query: PostQueryDto) {
    return this.postService.findAll(query);
  }

  @Get(':id')
  @Permissions('posts.read')
  findOne(@Param('id') id: string) {
    return this.postService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EDITOR)
  @Permissions('posts.update')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePostDto) {
    return this.postService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('posts.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postService.remove(id);
  }
}
