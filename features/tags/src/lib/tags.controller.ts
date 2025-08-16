import { Permissions, Roles } from '@/decorators';
import { CreateTagDto, TagQueryDto } from '@/dtos';
import { UserRole } from '@/enums';
import { JwtAuthGuard, RolesGuard } from '@/guards';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { TagService } from './tags.service';

@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, 'editor')
  @Permissions('tags.create')
  @Post()
  create(@Body() body: CreateTagDto) {
    return this.tagService.create(body.name, body.slug);
  }

  @Get()
  @Permissions('tags.read')
  findAll(@Query() query: TagQueryDto) {
    return this.tagService.findAll(query);
  }

  @Get(':id')
  @Permissions('tags.read')
  findOne(@Param('id') id: string) {
    return this.tagService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('tags.update')
  @Put(':id')
  recover(@Param('id') id: string) {
    return this.tagService.recover(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('tags.read')
  @Get('deleted')
  deleted() {
    return this.tagService.deleted();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('tags.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tagService.remove(id);
  }
}
