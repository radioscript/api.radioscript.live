import { Post, PostLike, PostView, User } from '@/entities';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostInteractionsController } from './post-interactions.controller';
import { PostInteractionsService } from './post-interactions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post, PostLike, PostView, User])],
  controllers: [PostInteractionsController],
  providers: [PostInteractionsService],
  exports: [PostInteractionsService],
})
export class PostInteractionsModule {}
