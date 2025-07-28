import { Roles } from '@/decorators';
import { CategoryQueryDto, CreateCategoryDto } from '@/dtos';
import { UserRole } from '@/enums';
import { JwtAuthGuard, RolesGuard } from '@/guards';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CategoryService } from './categories.service';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post()
  create(@Body() body: CreateCategoryDto) {
    return this.categoryService.create(body.name, body.slug, body.parentId);
  }

  @Get()
  findAll(@Query() query: CategoryQueryDto) {
    return this.categoryService.findAll(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('deleted')
  deleted() {
    return this.categoryService.deleted();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Put('recover/:id')
  recover(@Param('id') id: string) {
    return this.categoryService.recover(id);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}
