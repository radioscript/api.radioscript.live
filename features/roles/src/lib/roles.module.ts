import { CacheModule } from '@/cache';
import { Permission, Role, User } from '@/entities';
import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RbacService } from './rbac.service';
import { RolesController } from './roles.controller';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission, User]), CacheModule],
  controllers: [RolesController],
  providers: [RbacService],
  exports: [RbacService],
})
export class RolesModule {}
