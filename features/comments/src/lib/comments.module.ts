import { Comment, Permission, Post, Role, User } from '@/entities';
import { JwtAuthGuard, RolesGuard } from '@/guards';
import { TokenModule } from '@/token';
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentController } from './comments.controller';
import { CommentService } from './comments.service';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Post, User, Role, Permission]), TokenModule],
  controllers: [CommentController],
  providers: [CommentService, JwtAuthGuard, RolesGuard, JwtService],
  exports: [CommentService],
})
export class CommentModule {}
