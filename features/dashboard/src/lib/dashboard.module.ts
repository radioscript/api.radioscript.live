import { Permission, Role, Token, User } from '@/entities';
import { JwtAuthGuard, RolesGuard } from '@/guards';
import { UserModule } from '@/users';
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

import { CommentModule } from '@/comments';
import { PostModule } from '@/posts';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  imports: [TypeOrmModule.forFeature([User, Token, Role, Permission]), UserModule, PostModule, CommentModule],
  controllers: [DashboardController],
  providers: [DashboardService, JwtAuthGuard, RolesGuard, JwtService],
  exports: [DashboardService],
})
export class DashboardModule {}
