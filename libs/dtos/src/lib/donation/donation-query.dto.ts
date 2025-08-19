import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';

export class DonationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['pending', 'completed', 'failed', 'cancelled'])
  paymentStatus?: 'pending' | 'completed' | 'failed' | 'cancelled';

  @IsOptional()
  @IsIn(['IRR', 'USD'])
  currency?: 'IRR' | 'USD';

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}
