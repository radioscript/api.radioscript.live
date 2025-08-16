import { Permission, Role, Tag, User } from '@/entities';
import { JwtAuthGuard, RolesGuard } from '@/guards';
import { TokenModule } from '@/token';
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagController } from './tags.controller';
import { TagService } from './tags.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tag, User, Role, Permission]), TokenModule],
  controllers: [TagController],
  providers: [TagService, JwtAuthGuard, RolesGuard, JwtService],
  exports: [TagService],
})
export class TagModule {}
