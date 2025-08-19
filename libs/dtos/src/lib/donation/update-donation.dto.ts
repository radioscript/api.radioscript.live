import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateDonationDto {
  @IsOptional()
  @IsEnum(['pending', 'completed', 'failed', 'cancelled'])
  paymentStatus?: 'pending' | 'completed' | 'failed' | 'cancelled';

  @IsOptional()
  @IsString()
  transactionId?: string;
}
