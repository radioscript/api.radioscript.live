import { IsBoolean, IsEmail, IsOptional, IsPhoneNumber, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  avatar_url?: string;

  @IsString()
  @IsOptional()
  first_name?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  last_name?: string;

  @IsString()
  @IsOptional()
  picture?: string;

  @IsPhoneNumber()
  @IsOptional()
  phone_number?: string;

  @IsBoolean()
  @IsOptional()
  blocked?: boolean;

  @IsString()
  @IsOptional()
  block_reason?: string;
}
