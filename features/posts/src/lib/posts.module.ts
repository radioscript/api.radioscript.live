import { Category, Media, Permission, Post, PostMeta, Role, Tag, User } from '@/entities';
import { JwtAuthGuard, RolesGuard } from '@/guards';
import { TokenModule } from '@/token';
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostController } from './posts.controller';
import { PostService } from './posts.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post, PostMeta, Tag, Category, Media, User, Role, Permission]), TokenModule],
  controllers: [PostController],
  providers: [PostService, JwtAuthGuard, RolesGuard, JwtService],
  exports: [PostService],
})
export class PostModule {}
