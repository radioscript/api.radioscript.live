import { Meta, Permission, Post, PostMeta, Role, User } from '@/entities';
import { JwtAuthGuard, RolesGuard } from '@/guards';
import { TokenModule } from '@/token';
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostMetaController } from './post-meta.controller';
import { PostMetaService } from './post-meta.service';

@Module({
  imports: [TypeOrmModule.forFeature([PostMeta, Post, Meta, User, Role, Permission]), TokenModule],
  controllers: [PostMetaController],
  providers: [PostMetaService, JwtAuthGuard, RolesGuard, JwtService],
  exports: [PostMetaService],
})
export class PostMetaModule {}
