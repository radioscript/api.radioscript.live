# RBAC Implementation Guide

## Overview

This project now implements a comprehensive Role-Based Access Control (RBAC) system with PostgreSQL tables for roles and permissions. The system supports both legacy enum-based roles and the new database-driven RBAC.

## Database Schema

### Tables Created

- `roles` - Stores role definitions
- `permissions` - Stores permission definitions
- `user_roles` - Many-to-many relationship between users and roles
- `role_permissions` - Many-to-many relationship between roles and permissions

### Entities

- `Role` - Role entity with name, display_name, description
- `Permission` - Permission entity with name, display_name, description, resource, action
- `User` - Updated to support many-to-many roles relationship

## Usage Examples

### 1. Using @Roles Decorator (Legacy + New)

```typescript
import { Controller, Post, UseGuards } from '@nestjs/common';
import { Roles } from '@/decorators';
import { UserRole } from '@/enums';
import { JwtAuthGuard, RolesGuard } from '@/guards';

@Controller('posts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PostsController {
  // Using legacy enum roles
  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  createPost() {
    // Only users with ADMIN or SUPER_ADMIN enum role can access
  }

  // Using new string-based roles
  @Post('advanced')
  @Roles('content-manager', 'editor')
  createAdvancedPost() {
    // Only users with content-manager or editor roles can access
  }
}
```

### 2. Using @Permissions Decorator

```typescript
import { Controller, Post, UseGuards } from '@nestjs/common';
import { Permissions } from '@/decorators';
import { JwtAuthGuard, RolesGuard } from '@/guards';

@Controller('posts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PostsController {
  @Post()
  @Permissions('posts.create')
  createPost() {
    // Only users with posts.create permission can access
  }

  @Delete(':id')
  @Permissions('posts.delete', 'admin.override')
  deletePost() {
    // Users with either posts.delete OR admin.override permission can access
  }
}
```

### 3. Combining @Roles and @Permissions

```typescript
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @Post('users')
  @Roles(UserRole.ADMIN)
  @Permissions('users.create')
  createUser() {
    // User must have ADMIN role OR users.create permission
    // (OR logic - either condition satisfies access)
  }
}
```

### 4. Using RbacService

```typescript
import { Injectable } from '@nestjs/common';
import { RbacService } from '@/roles';

@Injectable()
export class SomeService {
  constructor(private rbacService: RbacService) {}

  async checkUserAccess(userId: string) {
    // Check specific permission
    const canCreatePosts = await this.rbacService.checkUserPermission(userId, 'posts.create');

    // Check specific role
    const isAdmin = await this.rbacService.checkUserRole(userId, 'admin');

    // Get all user permissions
    const permissions = await this.rbacService.getUserPermissions(userId);

    // Get all user roles
    const roles = await this.rbacService.getUserRoles(userId);

    return { canCreatePosts, isAdmin, permissions, roles };
  }
}
```

## RBAC Management API Endpoints

### Role Management

- `POST /rbac/roles` - Create a new role
- `GET /rbac/roles` - Get all roles
- `GET /rbac/roles/:id` - Get role by ID
- `PUT /rbac/roles/:id` - Update role
- `DELETE /rbac/roles/:id` - Delete role (soft delete)

### Permission Management

- `POST /rbac/permissions` - Create a new permission
- `GET /rbac/permissions` - Get all permissions
- `GET /rbac/permissions/:id` - Get permission by ID
- `PUT /rbac/permissions/:id` - Update permission
- `DELETE /rbac/permissions/:id` - Delete permission (soft delete)

### Role-Permission Assignment

- `POST /rbac/roles/:roleId/permissions/:permissionId` - Assign permission to role
- `DELETE /rbac/roles/:roleId/permissions/:permissionId` - Remove permission from role

### User-Role Assignment

- `POST /rbac/users/:userId/roles/:roleId` - Assign role to user
- `DELETE /rbac/users/:userId/roles/:roleId` - Remove role from user
- `GET /rbac/users/:userId/roles` - Get user roles
- `GET /rbac/users/:userId/permissions` - Get user permissions

## Example API Usage

### 1. Create a Role

```bash
curl -X POST http://localhost:3000/rbac/roles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "content-manager",
    "displayName": "Content Manager",
    "description": "Manages all content creation and editing"
  }'
```

### 2. Create a Permission

```bash
curl -X POST http://localhost:3000/rbac/permissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "posts.publish",
    "displayName": "Publish Posts",
    "description": "Can publish posts to make them live",
    "resource": "posts",
    "action": "publish"
  }'
```

### 3. Assign Permission to Role

```bash
curl -X POST http://localhost:3000/rbac/roles/ROLE_ID/permissions/PERMISSION_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Assign Role to User

```bash
curl -X POST http://localhost:3000/rbac/users/USER_ID/roles/ROLE_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Default Roles and Permissions

The system automatically seeds the following roles and permissions on startup:

### Roles

- `super-admin` - Full system access
- `admin` - Full content and user management
- `editor` - Content management without deletion
- `user` - Basic user access

### Permission Categories

- **RBAC**: Role and permission management
- **Posts**: Content creation and management
- **Users**: User management
- **Categories**: Category management
- **Tags**: Tag management
- **Media**: Media file management
- **Comments**: Comment management
- **Dashboard**: Dashboard access

## Migration from Legacy System

The new system maintains backward compatibility with the existing `users.role` enum field. You can:

1. Continue using `@Roles(UserRole.ADMIN)` decorators
2. Gradually migrate to permission-based access using `@Permissions('resource.action')`
3. Assign database roles to users while keeping the enum field
4. Eventually deprecate the enum field once fully migrated

## Security Notes

1. **Super Admin Only**: Role and permission creation/deletion requires `super-admin` role
2. **Admin Access**: Most RBAC read operations require `admin` or `super-admin` role
3. **OR Logic**: If both `@Roles` and `@Permissions` are used, user needs either roles OR permissions (not both)
4. **Soft Deletion**: Roles and permissions are soft deleted (marked inactive) for audit trails
5. **Automatic Seeding**: Initial roles and permissions are created automatically on app startup

## Best Practices

1. **Use Permissions for Fine-Grained Control**: Prefer `@Permissions('resource.action')` over `@Roles`
2. **Naming Convention**: Use dot notation for permissions: `resource.action` (e.g., `posts.create`)
3. **Role Hierarchy**: Assign broader permissions to higher roles (admin gets more than editor)
4. **Resource Grouping**: Group related permissions by resource (posts, users, etc.)
5. **Audit Trail**: Keep role/permission changes logged for security auditing
