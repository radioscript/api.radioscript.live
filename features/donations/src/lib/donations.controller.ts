import { Roles } from '@/decorators';
import { CreateDonationDto, DonationQueryDto, UpdateDonationDto } from '@/dtos';
import { UserRole } from '@/enums';
import { JwtAuthGuard, RolesGuard } from '@/guards';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { DonationsService } from './donations.service';

@Controller('donations')
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateDonationDto) {
    return this.donationsService.create(req, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll(@Query() query: DonationQueryDto) {
    return this.donationsService.findAll(query);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getStats() {
    return this.donationsService.getDonationStats();
  }

  @Get('recent')
  async getRecentDonations(@Query('limit') limit = '10') {
    return this.donationsService.getRecentDonations(parseInt(limit));
  }

  @Get('top-donors')
  async getTopDonors(@Query('limit') limit = '10') {
    return this.donationsService.getTopDonors(parseInt(limit));
  }

  @Get('my-donations')
  @UseGuards(JwtAuthGuard)
  async getUserDonations(@Req() req: Request, @Query('page') page = '1', @Query('limit') limit = '10') {
    return this.donationsService.getUserDonations(req, parseInt(page), parseInt(limit));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findOne(@Param('id') id: string) {
    return this.donationsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() dto: UpdateDonationDto) {
    return this.donationsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    return this.donationsService.remove(id);
  }
}
