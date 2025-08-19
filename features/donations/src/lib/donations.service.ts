import { CreateDonationDto, DonationQueryDto, UpdateDonationDto } from '@/dtos';
import { Donation, User } from '@/entities';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';

@Injectable()
export class DonationsService {
  constructor(@InjectRepository(Donation) private readonly donationRepo: Repository<Donation>, @InjectRepository(User) private readonly userRepo: Repository<User>) {}

  async create(req: Request, dto: CreateDonationDto): Promise<Donation> {
    const userId = (req['user'] as any)?.sub;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    const donation = this.donationRepo.create({
      ...dto,
      userId,
      ipAddress,
      userAgent,
      user: userId ? await this.userRepo.findOneByOrFail({ id: userId }) : undefined,
    });

    return this.donationRepo.save(donation);
  }

  async findAll(query: DonationQueryDto) {
    const { search, paymentStatus, currency, paymentMethod, page = 1, limit = 10 } = query;

    const queryBuilder = this.donationRepo.createQueryBuilder('donation').leftJoinAndSelect('donation.user', 'user').orderBy('donation.created_at', 'DESC');

    if (search) {
      queryBuilder.andWhere('(donation.donorName ILIKE :search OR donation.donorEmail ILIKE :search OR donation.message ILIKE :search)', { search: `%${search}%` });
    }

    if (paymentStatus) {
      queryBuilder.andWhere('donation.paymentStatus = :paymentStatus', { paymentStatus });
    }

    if (currency) {
      queryBuilder.andWhere('donation.currency = :currency', { currency });
    }

    if (paymentMethod) {
      queryBuilder.andWhere('donation.paymentMethod = :paymentMethod', { paymentMethod });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Donation> {
    const donation = await this.donationRepo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!donation) {
      throw new NotFoundException('Donation not found');
    }

    return donation;
  }

  async update(id: string, dto: UpdateDonationDto): Promise<Donation> {
    const donation = await this.findOne(id);
    Object.assign(donation, dto);
    return this.donationRepo.save(donation);
  }

  async remove(id: string) {
    const donation = await this.findOne(id);
    return this.donationRepo.softRemove(donation);
  }

  // Statistics methods
  async getDonationStats() {
    const totalDonations = await this.donationRepo.count();
    const completedDonations = await this.donationRepo.count({ where: { paymentStatus: 'completed' } });
    const pendingDonations = await this.donationRepo.count({ where: { paymentStatus: 'pending' } });
    const failedDonations = await this.donationRepo.count({ where: { paymentStatus: 'failed' } });

    const totalAmount = await this.donationRepo
      .createQueryBuilder('donation')
      .select('SUM(donation.amount)', 'total')
      .where('donation.paymentStatus = :status', { status: 'completed' })
      .getRawOne()
      .then((result) => parseFloat(result.total) || 0);

    const totalAmountIRR = await this.donationRepo
      .createQueryBuilder('donation')
      .select('SUM(donation.amount)', 'total')
      .where('donation.paymentStatus = :status AND donation.currency = :currency', { status: 'completed', currency: 'IRR' })
      .getRawOne()
      .then((result) => parseFloat(result.total) || 0);

    const totalAmountUSD = await this.donationRepo
      .createQueryBuilder('donation')
      .select('SUM(donation.amount)', 'total')
      .where('donation.paymentStatus = :status AND donation.currency = :currency', { status: 'completed', currency: 'USD' })
      .getRawOne()
      .then((result) => parseFloat(result.total) || 0);

    // Calculate total donations count by currency
    const totalDonationsIRR = await this.donationRepo.count({
      where: { paymentStatus: 'completed', currency: 'IRR' },
    });

    const totalDonationsUSD = await this.donationRepo.count({
      where: { paymentStatus: 'completed', currency: 'USD' },
    });

    return {
      totalDonations,
      completedDonations,
      pendingDonations,
      failedDonations,
      totalAmount,
      totalAmountIRR,
      totalAmountUSD,
      totalDonationsIRR,
      totalDonationsUSD,
      successRate: totalDonations > 0 ? (completedDonations / totalDonations) * 100 : 0,
    };
  }

  async getUserDonations(req: Request, page: number = 1, limit: number = 10) {
    const userId = (req['user'] as any).sub;

    const [data, total] = await this.donationRepo.findAndCount({
      where: { userId },
      relations: ['user'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getRecentDonations(limit: number = 10) {
    return this.donationRepo.find({
      where: { paymentStatus: 'completed' },
      relations: ['user'],
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  async getTopDonors(limit: number = 10) {
    return this.donationRepo
      .createQueryBuilder('donation')
      .select('donation.donorName', 'donorName')
      .addSelect('donation.donorEmail', 'donorEmail')
      .addSelect('SUM(donation.amount)', 'totalAmount')
      .addSelect('COUNT(donation.id)', 'donationCount')
      .where('donation.paymentStatus = :status', { status: 'completed' })
      .andWhere('donation.isAnonymous = :anonymous', { anonymous: false })
      .groupBy('donation.donorName, donation.donorEmail')
      .orderBy('totalAmount', 'DESC')
      .limit(limit)
      .getRawMany();
  }
}
