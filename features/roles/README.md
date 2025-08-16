# roles

This library provides Role-Based Access Control (RBAC) functionality for the Radio Script API.

## Features

- Role management (create, read, update, delete)
- Permission management (create, read, update, delete)
- Role-Permission assignment
- User-Role assignment
- Permission checking utilities

## Usage

### Import the module

```typescript
import { RolesModule } from '@/roles';

@Module({
  imports: [RolesModule],
})
export class AppModule {}
```

### Use decorators for access control

```typescript
import { Roles, Permissions } from '@/decorators';
import { UserRole } from '@/enums';

@Controller('posts')
export class PostsController {
  @Post()
  @Roles(UserRole.ADMIN)
  @Permissions('posts.create')
  create() {
    // Only users with ADMIN role OR posts.create permission can access
  }
}
```

### Use the RBAC service

```typescript
import { RbacService } from '@/roles';

@Injectable()
export class SomeService {
  constructor(private rbacService: RbacService) {}

  async checkPermission(userId: string) {
    const hasPermission = await this.rbacService.checkUserPermission(userId, 'posts.create');
    return hasPermission;
  }
}
```

## API Endpoints

- `POST /rbac/roles` - Create a new role
- `GET /rbac/roles` - Get all roles
- `GET /rbac/roles/:id` - Get role by ID
- `PUT /rbac/roles/:id` - Update role
- `DELETE /rbac/roles/:id` - Delete role
- `POST /rbac/permissions` - Create a new permission
- `GET /rbac/permissions` - Get all permissions
- `POST /rbac/users/:userId/roles/:roleId` - Assign role to user
- `GET /rbac/users/:userId/permissions` - Get user permissions
