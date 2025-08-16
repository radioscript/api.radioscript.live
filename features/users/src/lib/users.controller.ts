import { Permissions, Roles } from '@/decorators';
import { UpdateUserDto, UserQueryDto } from '@/dtos';
import { User } from '@/entities';
import { UserRole } from '@/enums';
import { JwtAuthGuard, RolesGuard } from '@/guards';
import { Body, Controller, Delete, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { UserService } from './users.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Permissions('users.read', 'users.update', 'users.delete')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Permissions('users.read')
  async findAll(@Query() query: UserQueryDto) {
    return await this.userService.findAll(query);
  }

  @Get(':id')
  @Permissions('users.read')
  async findOne(@Param('id') id: string): Promise<User> {
    return await this.userService.findOne(id);
  }

  @Put(':id')
  @Permissions('users.update')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return await this.userService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @Permissions('users.delete')
  async remove(@Param('id') id: string): Promise<void> {
    await this.userService.deleteUser(id);
  }
}
