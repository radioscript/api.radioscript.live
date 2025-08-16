import { Permissions, Roles } from '@/decorators';
import { UserRole } from '@/enums';
import { JwtAuthGuard, RolesGuard } from '@/guards';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, 'editor')
@Permissions('dashboard.access')
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('stats')
  @Permissions('dashboard.access')
  getDashboardData() {
    return this.dashboardService.getDashboardData();
  }
}
