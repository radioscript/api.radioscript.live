import { Permission, Role } from '@/entities';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>
  ) {}

  async onModuleInit() {
    await this.seedRoles();
    await this.seedPermissions();
    await this.assignPermissionsToRoles();
  }

  private async seedRoles() {
    const roles = [
      {
        name: 'super-admin',
        display_name: 'Super Administrator',
        description: 'Full system access with ability to create other admins',
      },
      {
        name: 'admin',
        display_name: 'Administrator',
        description: 'Full content and user management access',
      },
      {
        name: 'editor',
        display_name: 'Editor',
        description: 'Content management access without deletion',
      },
      {
        name: 'user',
        display_name: 'User',
        description: 'Basic user access',
      },
    ];

    for (const roleData of roles) {
      const existingRole = await this.roleRepository.findOne({ where: { name: roleData.name } });
      if (!existingRole) {
        const role = this.roleRepository.create(roleData);
        await this.roleRepository.save(role);
        console.log(`Created role: ${roleData.name}`);
      }
    }
  }

  private async seedPermissions() {
    const permissions = [
      // RBAC Permissions
      { name: 'rbac.roles.create', display_name: 'Create Roles', resource: 'rbac', action: 'create' },
      { name: 'rbac.roles.read', display_name: 'Read Roles', resource: 'rbac', action: 'read' },
      { name: 'rbac.roles.update', display_name: 'Update Roles', resource: 'rbac', action: 'update' },
      { name: 'rbac.roles.delete', display_name: 'Delete Roles', resource: 'rbac', action: 'delete' },
      { name: 'rbac.roles.manage-permissions', display_name: 'Manage Role Permissions', resource: 'rbac', action: 'manage' },

      { name: 'rbac.permissions.create', display_name: 'Create Permissions', resource: 'rbac', action: 'create' },
      { name: 'rbac.permissions.read', display_name: 'Read Permissions', resource: 'rbac', action: 'read' },
      { name: 'rbac.permissions.update', display_name: 'Update Permissions', resource: 'rbac', action: 'update' },
      { name: 'rbac.permissions.delete', display_name: 'Delete Permissions', resource: 'rbac', action: 'delete' },

      { name: 'rbac.users.manage-roles', display_name: 'Manage User Roles', resource: 'rbac', action: 'manage' },
      { name: 'rbac.users.read-roles', display_name: 'Read User Roles', resource: 'rbac', action: 'read' },
      { name: 'rbac.users.read-permissions', display_name: 'Read User Permissions', resource: 'rbac', action: 'read' },

      // Posts Permissions
      { name: 'posts.create', display_name: 'Create Posts', resource: 'posts', action: 'create' },
      { name: 'posts.read', display_name: 'Read Posts', resource: 'posts', action: 'read' },
      { name: 'posts.update', display_name: 'Update Posts', resource: 'posts', action: 'update' },
      { name: 'posts.delete', display_name: 'Delete Posts', resource: 'posts', action: 'delete' },

      // Users Permissions
      { name: 'users.create', display_name: 'Create Users', resource: 'users', action: 'create' },
      { name: 'users.read', display_name: 'Read Users', resource: 'users', action: 'read' },
      { name: 'users.update', display_name: 'Update Users', resource: 'users', action: 'update' },
      { name: 'users.delete', display_name: 'Delete Users', resource: 'users', action: 'delete' },

      // Categories Permissions
      { name: 'categories.create', display_name: 'Create Categories', resource: 'categories', action: 'create' },
      { name: 'categories.read', display_name: 'Read Categories', resource: 'categories', action: 'read' },
      { name: 'categories.update', display_name: 'Update Categories', resource: 'categories', action: 'update' },
      { name: 'categories.delete', display_name: 'Delete Categories', resource: 'categories', action: 'delete' },

      // Tags Permissions
      { name: 'tags.create', display_name: 'Create Tags', resource: 'tags', action: 'create' },
      { name: 'tags.read', display_name: 'Read Tags', resource: 'tags', action: 'read' },
      { name: 'tags.update', display_name: 'Update Tags', resource: 'tags', action: 'update' },
      { name: 'tags.delete', display_name: 'Delete Tags', resource: 'tags', action: 'delete' },

      // Media Permissions
      { name: 'media.create', display_name: 'Create Media', resource: 'media', action: 'create' },
      { name: 'media.read', display_name: 'Read Media', resource: 'media', action: 'read' },
      { name: 'media.update', display_name: 'Update Media', resource: 'media', action: 'update' },
      { name: 'media.delete', display_name: 'Delete Media', resource: 'media', action: 'delete' },

      // Comments Permissions
      { name: 'comments.create', display_name: 'Create Comments', resource: 'comments', action: 'create' },
      { name: 'comments.read', display_name: 'Read Comments', resource: 'comments', action: 'read' },
      { name: 'comments.update', display_name: 'Update Comments', resource: 'comments', action: 'update' },
      { name: 'comments.delete', display_name: 'Delete Comments', resource: 'comments', action: 'delete' },

      // Dashboard Permissions
      { name: 'dashboard.access', display_name: 'Access Dashboard', resource: 'dashboard', action: 'read' },
    ];

    for (const permissionData of permissions) {
      const existingPermission = await this.permissionRepository.findOne({ where: { name: permissionData.name } });
      if (!existingPermission) {
        const permission = this.permissionRepository.create(permissionData);
        await this.permissionRepository.save(permission);
        console.log(`Created permission: ${permissionData.name}`);
      }
    }
  }

  private async assignPermissionsToRoles() {
    // Super Admin gets all permissions
    const superAdminRole = await this.roleRepository.findOne({
      where: { name: 'super-admin' },
      relations: ['permissions'],
    });
    const allPermissions = await this.permissionRepository.find();

    if (superAdminRole && !superAdminRole.permissions?.length) {
      superAdminRole.permissions = allPermissions;
      await this.roleRepository.save(superAdminRole);
      console.log('Assigned all permissions to super-admin role');
    }

    // Admin gets most permissions (excluding super-admin specific ones)
    const adminRole = await this.roleRepository.findOne({
      where: { name: 'admin' },
      relations: ['permissions'],
    });
    const adminPermissions = allPermissions.filter(
      (p) => !p.name.includes('rbac.roles.create') && !p.name.includes('rbac.roles.delete') && !p.name.includes('rbac.permissions.create') && !p.name.includes('rbac.permissions.delete')
    );

    if (adminRole && !adminRole.permissions?.length) {
      adminRole.permissions = adminPermissions;
      await this.roleRepository.save(adminRole);
      console.log('Assigned admin permissions to admin role');
    }

    // Editor gets content management permissions
    const editorRole = await this.roleRepository.findOne({
      where: { name: 'editor' },
      relations: ['permissions'],
    });
    const editorPermissions = allPermissions.filter(
      (p) =>
        p.name.includes('posts.create') ||
        p.name.includes('posts.read') ||
        p.name.includes('posts.update') ||
        p.name.includes('categories.read') ||
        p.name.includes('tags.read') ||
        p.name.includes('media.create') ||
        p.name.includes('media.read') ||
        p.name.includes('comments.read') ||
        p.name.includes('dashboard.access')
    );

    if (editorRole && !editorRole.permissions?.length) {
      editorRole.permissions = editorPermissions;
      await this.roleRepository.save(editorRole);
      console.log('Assigned editor permissions to editor role');
    }

    // User gets basic read permissions
    const userRole = await this.roleRepository.findOne({
      where: { name: 'user' },
      relations: ['permissions'],
    });
    const userPermissions = allPermissions.filter(
      (p) => p.name.includes('posts.read') || p.name.includes('categories.read') || p.name.includes('tags.read') || p.name.includes('comments.create') || p.name.includes('comments.read')
    );

    if (userRole && !userRole.permissions?.length) {
      userRole.permissions = userPermissions;
      await this.roleRepository.save(userRole);
      console.log('Assigned user permissions to user role');
    }
  }
}
