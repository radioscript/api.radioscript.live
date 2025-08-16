import { Permissions } from '@/decorators';
import { CommentQueryDto } from '@/dtos';
import { JwtAuthGuard, RolesGuard } from '@/guards';
import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CommentService } from './comments.service';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('comments.create')
  @Post()
  create(@Body() body: { content: string; authorId: string; postId: string }) {
    return this.commentService.create(body.content, body.authorId, body.postId);
  }

  @Get()
  @Permissions('comments.read')
  findAll(@Query() query: CommentQueryDto) {
    return this.commentService.findAll(query);
  }

  @Get(':id')
  @Permissions('comments.read')
  findOne(@Param('id') id: string) {
    return this.commentService.findOne(id);
  }

  @Get('post/:postId')
  @Permissions('comments.read')
  findAllByPost(@Param('postId') postId: string, @Query() query: CommentQueryDto) {
    return this.commentService.findAllByPost(postId, query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('comments.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commentService.remove(id);
  }
}
