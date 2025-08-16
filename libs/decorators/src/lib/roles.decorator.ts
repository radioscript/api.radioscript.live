import { UserRole } from '@/enums';
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: (UserRole | string)[]) => SetMetadata(ROLES_KEY, roles);

// Support both enum values and string role names
// @Roles(UserRole.ADMIN) or @Roles('admin', 'super-admin')
