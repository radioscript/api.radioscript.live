import { CreatePostLikeDto, CreatePostViewDto } from '@/dtos';
import { JwtAuthGuard } from '@/guards';
import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { PostInteractionsService } from './post-interactions.service';

@Controller('post-interactions')
export class PostInteractionsController {
  constructor(private readonly postInteractionsService: PostInteractionsService) {}

  @Post('like')
  @UseGuards(JwtAuthGuard)
  async likePost(@Req() req: Request, @Body() dto: CreatePostLikeDto) {
    return this.postInteractionsService.likePost(req, dto);
  }

  @Get('like/:postId')
  @UseGuards(JwtAuthGuard)
  async checkUserLike(@Req() req: Request, @Param('postId') postId: string) {
    return this.postInteractionsService.checkUserLike(req, postId);
  }

  @Post('view')
  async recordView(@Req() req: Request, @Body() dto: CreatePostViewDto) {
    return this.postInteractionsService.recordView(req, dto);
  }

  @Post('view/:postId/duration')
  async updateViewDuration(@Req() req: Request, @Param('postId') postId: string, @Body() body: { viewDuration: number; isCompleted?: boolean }) {
    return this.postInteractionsService.updateViewDuration(req, postId, body.viewDuration, body.isCompleted);
  }

  @Get('stats/:postId')
  async getPostStats(@Param('postId') postId: string) {
    return this.postInteractionsService.getPostStats(postId);
  }

  @Get('liked-posts')
  @UseGuards(JwtAuthGuard)
  async getUserLikedPosts(@Req() req: Request, @Query('page') page = '1', @Query('limit') limit = '10') {
    return this.postInteractionsService.getUserLikedPosts(req, parseInt(page), parseInt(limit));
  }
}
