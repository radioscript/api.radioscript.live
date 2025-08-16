import { Category, Permission, Role, User } from '@/entities';
import { JwtAuthGuard, RolesGuard } from '@/guards';
import { TokenModule } from '@/token';
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryController } from './categories.controller';
import { CategoryService } from './categories.service';

@Module({
  imports: [TypeOrmModule.forFeature([Category, User, Role, Permission]), TokenModule],
  controllers: [CategoryController],
  providers: [CategoryService, JwtAuthGuard, RolesGuard, JwtService],
  exports: [CategoryService],
})
export class CategoryModule {}
