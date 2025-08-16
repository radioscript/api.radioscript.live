import { PERMISSIONS_KEY, ROLES_KEY } from '@/decorators';
import { Permission, Role, User } from '@/entities';
import { UserRole } from '@/enums';
import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    private reflector: Reflector,
    private i18n: I18nService
  ) {}

  async canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride<(UserRole | string)[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    // If no roles or permissions are required, allow access
    if (!requiredRoles && !requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const userId = user?.sub || user?.user_id || user?.id;

    if (!user || !userId) {
      throw new UnauthorizedException(this.i18n.t('error.UNAUTHORIZED'));
    }

    // Fetch user with their roles and permissions
    const foundUser = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'],
    });

    if (!foundUser) {
      throw new UnauthorizedException(this.i18n.t('error.UNAUTHORIZED'));
    }

    // Check legacy enum role (backward compatibility)
    const hasLegacyRole = requiredRoles?.some((role) => {
      if (typeof role === 'string') return role === foundUser.role;
      return role === foundUser.role;
    });

    // Check database roles
    const userRoleNames = foundUser.roles?.map((role) => role.name) || [];
    const hasDbRole = requiredRoles?.some((role) => {
      const roleName = typeof role === 'string' ? role : String(role);
      return userRoleNames.includes(roleName);
    });

    // Check permissions
    const userPermissions = foundUser.roles?.flatMap((role) => role.permissions?.map((p) => p.name) || []) || [];
    const hasPermission = requiredPermissions?.some((permission) => userPermissions.includes(permission));

    // User must have at least one required role OR one required permission
    const hasAccess = hasLegacyRole || hasDbRole || hasPermission;

    if (!hasAccess) {
      throw new ForbiddenException(this.i18n.t('error.FORBIDDEN'));
    }

    return true;
  }
}
