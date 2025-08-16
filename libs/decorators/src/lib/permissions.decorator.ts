import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: string[]) => SetMetadata(PERMISSIONS_KEY, permissions);

// Usage examples:
// @Permissions('posts.create', 'posts.update')
// @Permissions('users.delete')
// @Permissions('admin.access')
