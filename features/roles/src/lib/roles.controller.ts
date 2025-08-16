import { Permissions, Roles } from '@/decorators';
import { Permission, Role } from '@/entities';
import { UserRole } from '@/enums';
import { JwtAuthGuard, RolesGuard } from '@/guards';
import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { RbacService } from './rbac.service';

@Controller('rbac')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolesController {
  constructor(private readonly rbacService: RbacService) {}

  // Role Management
  @Post('roles')
  @Roles(UserRole.SUPER_ADMIN)
  @Permissions('rbac.roles.create')
  async createRole(@Body() createRoleDto: { name: string; displayName?: string; description?: string }): Promise<Role> {
    return this.rbacService.createRole(createRoleDto.name, createRoleDto.displayName, createRoleDto.description);
  }

  @Get('roles')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('rbac.roles.read')
  async getAllRoles(): Promise<Role[]> {
    return this.rbacService.getAllRoles();
  }

  @Get('roles/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('rbac.roles.read')
  async getRoleById(@Param('id') id: string): Promise<Role> {
    return this.rbacService.getRoleById(id);
  }

  @Put('roles/:id')
  @Roles(UserRole.SUPER_ADMIN)
  @Permissions('rbac.roles.update')
  async updateRole(@Param('id') id: string, @Body() updateData: Partial<Role>): Promise<Role> {
    return this.rbacService.updateRole(id, updateData);
  }

  @Delete('roles/:id')
  @Roles(UserRole.SUPER_ADMIN)
  @Permissions('rbac.roles.delete')
  async deleteRole(@Param('id') id: string): Promise<void> {
    return this.rbacService.deleteRole(id);
  }

  // Permission Management
  @Post('permissions')
  @Roles(UserRole.SUPER_ADMIN)
  @Permissions('rbac.permissions.create')
  async createPermission(@Body() createPermissionDto: { name: string; displayName?: string; description?: string; resource?: string; action?: string }): Promise<Permission> {
    return this.rbacService.createPermission(createPermissionDto.name, createPermissionDto.displayName, createPermissionDto.description, createPermissionDto.resource, createPermissionDto.action);
  }

  @Get('permissions')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('rbac.permissions.read')
  async getAllPermissions(): Promise<Permission[]> {
    return this.rbacService.getAllPermissions();
  }

  @Get('permissions/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('rbac.permissions.read')
  async getPermissionById(@Param('id') id: string): Promise<Permission> {
    return this.rbacService.getPermissionById(id);
  }

  @Put('permissions/:id')
  @Roles(UserRole.SUPER_ADMIN)
  @Permissions('rbac.permissions.update')
  async updatePermission(@Param('id') id: string, @Body() updateData: Partial<Permission>): Promise<Permission> {
    return this.rbacService.updatePermission(id, updateData);
  }

  @Delete('permissions/:id')
  @Roles(UserRole.SUPER_ADMIN)
  @Permissions('rbac.permissions.delete')
  async deletePermission(@Param('id') id: string): Promise<void> {
    return this.rbacService.deletePermission(id);
  }

  // Role-Permission Assignment
  @Post('roles/:roleId/permissions/:permissionId')
  @Roles(UserRole.SUPER_ADMIN)
  @Permissions('rbac.roles.manage-permissions')
  async assignPermissionToRole(@Param('roleId') roleId: string, @Param('permissionId') permissionId: string): Promise<Role> {
    return this.rbacService.assignPermissionToRole(roleId, permissionId);
  }

  @Delete('roles/:roleId/permissions/:permissionId')
  @Roles(UserRole.SUPER_ADMIN)
  @Permissions('rbac.roles.manage-permissions')
  async removePermissionFromRole(@Param('roleId') roleId: string, @Param('permissionId') permissionId: string): Promise<Role> {
    return this.rbacService.removePermissionFromRole(roleId, permissionId);
  }

  // User-Role Assignment
  @Post('users/:userId/roles/:roleId')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('rbac.users.manage-roles')
  async assignRoleToUser(@Param('userId') userId: string, @Param('roleId') roleId: string) {
    return this.rbacService.assignRoleToUser(userId, roleId);
  }

  @Delete('users/:userId/roles/:roleId')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('rbac.users.manage-roles')
  async removeRoleFromUser(@Param('userId') userId: string, @Param('roleId') roleId: string) {
    return this.rbacService.removeRoleFromUser(userId, roleId);
  }

  @Get('users/:userId/roles')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('rbac.users.read-roles')
  async getUserRoles(@Param('userId') userId: string) {
    return this.rbacService.getUserRoles(userId);
  }

  @Get('users/:userId/permissions')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('rbac.users.read-permissions')
  async getUserPermissions(@Param('userId') userId: string) {
    return this.rbacService.getUserPermissions(userId);
  }
}
