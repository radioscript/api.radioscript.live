import { IsBoolean, IsEmail, IsIn, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateDonationDto {
  @IsOptional()
  @IsString()
  donorName?: string;

  @IsOptional()
  @IsEmail()
  donorEmail?: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsIn(['IRR', 'USD'])
  currency?: 'IRR' | 'USD';

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  message?: string;

  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;

  @IsOptional()
  @IsString()
  viewerId?: string; // userId for logged users, guest-{uuid} for anonymous users
}
