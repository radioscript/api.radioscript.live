import { CacheService } from '@/cache';
import { Permission, Role, User } from '@/entities';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';

@Injectable()
export class RbacService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly i18n: I18nService,
    private readonly cacheService: CacheService
  ) {}

  // Role Management
  async createRole(name: string, displayName?: string, description?: string): Promise<Role> {
    const existingRole = await this.roleRepository.findOne({ where: { name } });
    if (existingRole) {
      throw new ConflictException(`Role ${name} already exists`);
    }

    const role = this.roleRepository.create({
      name,
      display_name: displayName,
      description,
    });

    return this.roleRepository.save(role);
  }

  async getAllRoles(): Promise<Role[]> {
    return this.roleRepository.find({
      relations: ['permissions'],
      where: { is_active: true },
    });
  }

  async getRoleById(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id, is_active: true },
      relations: ['permissions', 'users'],
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return role;
  }

  async getRoleByName(name: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { name, is_active: true },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException(`Role ${name} not found`);
    }

    return role;
  }

  async updateRole(id: string, updateData: Partial<Role>): Promise<Role> {
    const role = await this.getRoleById(id);
    Object.assign(role, updateData);
    return this.roleRepository.save(role);
  }

  async deleteRole(id: string): Promise<void> {
    const role = await this.getRoleById(id);
    role.is_active = false;
    await this.roleRepository.save(role);
  }

  // Permission Management
  async createPermission(name: string, displayName?: string, description?: string, resource?: string, action?: string): Promise<Permission> {
    const existingPermission = await this.permissionRepository.findOne({ where: { name } });
    if (existingPermission) {
      throw new ConflictException(`Permission ${name} already exists`);
    }

    const permission = this.permissionRepository.create({
      name,
      display_name: displayName,
      description,
      resource,
      action,
    });

    return this.permissionRepository.save(permission);
  }

  async getAllPermissions(): Promise<Permission[]> {
    return this.permissionRepository.find({
      where: { is_active: true },
    });
  }

  async getPermissionById(id: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id, is_active: true },
      relations: ['roles'],
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    return permission;
  }

  async getPermissionByName(name: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { name, is_active: true },
    });

    if (!permission) {
      throw new NotFoundException(`Permission ${name} not found`);
    }

    return permission;
  }

  async updatePermission(id: string, updateData: Partial<Permission>): Promise<Permission> {
    const permission = await this.getPermissionById(id);
    Object.assign(permission, updateData);
    return this.permissionRepository.save(permission);
  }

  async deletePermission(id: string): Promise<void> {
    const permission = await this.getPermissionById(id);
    permission.is_active = false;
    await this.permissionRepository.save(permission);
  }

  // Role-Permission Management
  async assignPermissionToRole(roleId: string, permissionId: string): Promise<Role> {
    const role = await this.getRoleById(roleId);
    const permission = await this.getPermissionById(permissionId);

    if (!role.permissions) {
      role.permissions = [];
    }

    const hasPermission = role.permissions.some((p) => p.id === permission.id);
    if (!hasPermission) {
      role.permissions.push(permission);
      await this.roleRepository.save(role);
    }

    return role;
  }

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<Role> {
    const role = await this.getRoleById(roleId);

    if (role.permissions) {
      role.permissions = role.permissions.filter((p) => p.id !== permissionId);
      await this.roleRepository.save(role);
    }

    return role;
  }

  // User-Role Management
  async assignRoleToUser(userId: string, roleId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const role = await this.getRoleById(roleId);

    if (!user.roles) {
      user.roles = [];
    }

    const hasRole = user.roles.some((r) => r.id === role.id);
    if (!hasRole) {
      user.roles.push(role);
      await this.userRepository.save(user);

      // Invalidate user cache after role assignment
      await this.cacheService.invalidateUserCache(userId);
    }

    return user;
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (user.roles) {
      user.roles = user.roles.filter((r) => r.id !== roleId);
      await this.userRepository.save(user);

      // Invalidate user cache after role removal
      await this.cacheService.invalidateUserCache(userId);
    }

    return user;
  }

  async getUserRoles(userId: string): Promise<Role[]> {
    const cacheKey = this.cacheService.getUserRolesCacheKey(userId);

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const user = await this.userRepository.findOne({
          where: { id: userId },
          relations: ['roles', 'roles.permissions'],
        });

        if (!user) {
          throw new NotFoundException(`User with ID ${userId} not found`);
        }

        return user.roles || [];
      },
      300 // 5 minutes cache
    );
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const cacheKey = this.cacheService.getUserPermissionsCacheKey(userId);

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const roles = await this.getUserRoles(userId);
        const permissions = roles.flatMap((role) => role.permissions?.map((p) => p.name) || []);
        return [...new Set(permissions)]; // Remove duplicates
      },
      300 // 5 minutes cache
    );
  }

  // Utility Methods
  async checkUserPermission(userId: string, permissionName: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissions.includes(permissionName);
  }

  async checkUserRole(userId: string, roleName: string): Promise<boolean> {
    const roles = await this.getUserRoles(userId);
    return roles.some((role) => role.name === roleName);
  }
}
