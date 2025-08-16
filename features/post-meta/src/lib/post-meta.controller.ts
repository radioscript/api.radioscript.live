import { Permissions, Roles } from '@/decorators';
import { CreatePostMetaDto, UpdatePostMetaDto } from '@/dtos';
import { UserRole } from '@/enums';
import { JwtAuthGuard, RolesGuard } from '@/guards';
import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { PostMetaService } from './post-meta.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, 'editor')
@Permissions('posts.create', 'posts.update', 'posts.delete')
@Controller('post-meta')
export class PostMetaController {
  constructor(private readonly metaService: PostMetaService) {}

  @Post()
  @Permissions('posts.create')
  create(@Body() dto: CreatePostMetaDto) {
    return this.metaService.create(dto);
  }

  @Get('post/:postId')
  @Permissions('posts.read')
  findAll(@Param('postId') postId: string) {
    return this.metaService.findByPostId(postId);
  }

  @Patch(':id')
  @Permissions('posts.update')
  update(@Param('id') id: string, @Body() dto: UpdatePostMetaDto) {
    return this.metaService.update(id, dto);
  }

  @Put('recover/:id')
  @Permissions('posts.update')
  recover(@Param('id') id: string) {
    return this.metaService.recover(id);
  }

  @Get('deleted')
  @Permissions('posts.read')
  deleted() {
    return this.metaService.deleted();
  }

  @Delete(':id')
  @Permissions('posts.delete')
  remove(@Param('id') id: string) {
    return this.metaService.remove(id);
  }
}
