import { CacheService } from '@/cache';
import { ChangePasswordDto, ForgotPasswordDto, GoogleOneTapDto, IdentityDto, LoginDto, LoginOtpDto, OtpDto, RegisterDto, UpdateEmailDto, UpdatePhoneNumberDto, UpdateProfileDto } from '@/dtos';
import { User } from '@/entities';

import { EncryptionService, S3Service } from '@/helpers';
import { DeviceInfo } from '@/interfaces';
import { OtpService } from '@/otp';
import { TokenService } from '@/token';
import { SocialLoginProvider } from '@/types';
import { BadRequestException, ConflictException, ForbiddenException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { I18nService } from 'nestjs-i18n';
import { extname } from 'path';
import { Repository } from 'typeorm';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly otpService: OtpService,
    private readonly s3Service: S3Service,
    private readonly encryptionService: EncryptionService,
    private tokenService: TokenService,
    private configService: ConfigService,
    private i18nService: I18nService,
    private readonly cacheService: CacheService
  ) {}

  async identityVerification({ email, phone_number }: IdentityDto) {
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { phone_number }],
    });
    if (existingUser) {
      return {
        userExist: true,
        hasPassword: existingUser.password ? true : false,
      };
    }

    await this.otpService.sendOtp(email ? email : phone_number);

    return { userExist: false };
  }

  async register({ email, phone_number, otp, password }: RegisterDto, deviceInfo: DeviceInfo) {
    const recipient = email ? email : phone_number;

    await this.otpService.verifyOtp(otp, recipient);
    const hashedPassword = await this.encryptionService.hash(password);
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { phone_number }],
      withDeleted: true,
    });

    if (existingUser) {
      throw new ConflictException('error.USER_EXIST');
    }

    if (existingUser?.deleted_at) {
      // Restore and update the soft-deleted user
      await this.userRepository.restore(existingUser.id);
      const user = await this.userRepository.save({
        ...existingUser,
        password: hashedPassword,
        phone_number,
        email,
        created_by: email ? 'email' : 'phone_number',
        deletedAt: null,
      });
      return this.createToken(user, deviceInfo);
    } else {
      const user = this.userRepository.create({
        email,
        phone_number,
        password: hashedPassword,
        created_by: email ? 'email' : 'phone_number',
      });
      const createdUser = await this.userRepository.save(user);
      return this.createToken(createdUser, deviceInfo);
    }
  }

  async login({ email, phone_number, password }: LoginDto, deviceInfo: DeviceInfo) {
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { phone_number }],
    });
    if (!existingUser) {
      throw new NotFoundException('error.USER_NOT_FOUND');
    }
    if (existingUser.created_by === 'social_login') {
      throw new BadRequestException('error.CREATED_BY_SOCIAL_LOGIN');
    }
    const isValidPassword = await this.encryptionService.compare(password, existingUser.password);

    if (!password || !isValidPassword) {
      throw new BadRequestException('error.INVALID_PASSWORD');
    }

    const token = await this.createToken(existingUser, deviceInfo);
    const profile = await this.getProfile(existingUser.id);
    return { ...token, ...profile };
  }

  async panelLogin({ email, phone_number, password }: LoginDto, deviceInfo: DeviceInfo) {
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { phone_number }],
      relations: ['roles', 'roles.permissions'],
    });
    if (!existingUser) {
      throw new NotFoundException('error.USER_NOT_FOUND');
    }

    // Check if user has admin or super-admin role
    const userRoles = existingUser.roles?.map((role) => role.name) || [];
    const hasAdminRole = userRoles.some((role) => role === 'admin' || role === 'super-admin');

    if (!hasAdminRole) {
      throw new ForbiddenException('error.FORBIDDEN');
    }

    const isValidPassword = await this.encryptionService.compare(password, existingUser.password);

    if (!password || !isValidPassword) {
      throw new BadRequestException('error.INVALID_PASSWORD');
    }

    // Get user roles and permissions with caching
    const roles = await this.getUserRoles(existingUser.id);
    const permissions = await this.getUserPermissions(existingUser.id);

    const token = await this.createToken(existingUser, deviceInfo);
    const profile = await this.getProfile(existingUser.id);

    return {
      ...token,
      ...profile,
      roles,
      permissions,
    };
  }

  async sendOtp({ email, phone_number }: OtpDto) {
    const recipient = email ? email : phone_number;

    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { phone_number }],
    });

    if (!existingUser) {
      throw new NotFoundException('error.USER_NOT_FOUND');
    }

    await this.otpService.sendOtp(recipient);

    return { message: this.i18nService.t('info.OTP_SENT') };
  }

  async loginOtp({ email, phone_number, otp }: LoginOtpDto, deviceInfo: DeviceInfo) {
    const recipient = email ? email : phone_number;
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { phone_number }],
    });

    if (!existingUser) {
      throw new NotFoundException('error.USER_NOT_FOUND');
    }

    await this.otpService.verifyOtp(otp, recipient);

    const token = await this.createToken(existingUser, deviceInfo);
    const profile = await this.getProfile(existingUser.id);

    return { ...token, ...profile };
  }

  async googleOneTapLogin({ credential }: GoogleOneTapDto, deviceInfo: DeviceInfo) {
    const { email, given_name, family_name, picture } = await this.tokenService.decodeJwt(credential);
    const existingUser = await this.userRepository.findOne({
      where: [{ email }],
    });

    if (existingUser) {
      await this.userRepository.update(existingUser.id, {
        first_name: given_name,
        last_name: family_name,
        avatar_url: existingUser.avatar_url ? existingUser.avatar_url : picture,
      });
      const tokens = await this.createToken(existingUser, deviceInfo);
      const profile = await this.getProfile(existingUser.id);

      return { ...tokens, ...profile };
    } else {
      const user = this.userRepository.create({
        email,
        first_name: given_name,
        last_name: family_name,
        avatar_url: picture,
        created_by: 'social_login',
      });
      await this.userRepository.save(user);
      const tokens = await this.createToken(user, deviceInfo);
      const profile = await this.getProfile(user.id);

      return { ...tokens, ...profile };
    }
  }

  async socialAuth({ email, first_name, last_name, picture }: any, provider: SocialLoginProvider, deviceInfo: DeviceInfo) {
    const existingUser = await this.userRepository.findOne({
      where: [{ email }],
    });

    if (existingUser) {
      await this.userRepository.update(existingUser.id, {
        first_name,
        last_name,
        avatar_url: picture,
      });
      const { access_token, refresh_token } = await this.createToken(existingUser, deviceInfo);
      return {
        url: this.createSocialCallbackUrl(access_token, refresh_token, provider),
        access_token,
        refresh_token,
      };
    } else {
      const user = this.userRepository.create({
        email,
        first_name,
        last_name,
        avatar_url: picture,
        created_by: 'social_login',
      });
      await this.userRepository.save(user);
      const { access_token, refresh_token } = await this.createToken(user, deviceInfo);
      return {
        url: this.createSocialCallbackUrl(access_token, refresh_token, provider),
        access_token,
        refresh_token,
      };
    }
  }

  async forgotPassword({ email, phone_number }: ForgotPasswordDto) {
    const recipient = email ? email : phone_number;
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { phone_number }],
    });
    if (!existingUser) {
      throw new NotFoundException('error.USER_NOT_FOUND');
    }

    await this.otpService.sendOtp(recipient);

    return { message: this.i18nService.t('info.OTP_SENT') };
  }

  async changePassword({ email, phone_number, otp, password, passwordConfirm }: ChangePasswordDto, deviceInfo: DeviceInfo) {
    const recipient = email ? email : phone_number;

    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { phone_number }],
    });
    if (!existingUser) {
      throw new NotFoundException('error.USER_NOT_FOUND');
    }

    if (password !== passwordConfirm) {
      throw new BadRequestException('error.PASSWORD_NOT_MATCH');
    }
    await this.otpService.verifyOtp(otp, recipient);

    const hashedPassword = await this.encryptionService.hash(password);

    this.userRepository.update(existingUser.id, { password: hashedPassword });

    const token = await this.createToken(existingUser, deviceInfo);
    const profile = await this.getProfile(existingUser.id);
    return { ...token, ...profile };
  }

  async getProfile(user_id: string) {
    return await this.userRepository.findOne({ where: { id: user_id } });
  }

  async updateProfile(user_id: string, updateProfileDto: UpdateProfileDto) {
    if (updateProfileDto.phone_number) {
      const existingPhoneNumber = await this.userRepository.findOne({
        where: { phone_number: updateProfileDto.phone_number },
      });
      if (existingPhoneNumber) {
        throw new ConflictException('error.USER_PHONE_EXIST');
      }
    }

    if (updateProfileDto.email) {
      const existingEmail = await this.userRepository.findOne({
        where: { email: updateProfileDto.email },
      });
      if (existingEmail) {
        throw new ConflictException('error.USER_EMAIL_EXIST');
      }
    }

    await this.userRepository.update(user_id, updateProfileDto);
    const profile = await this.getProfile(user_id);
    return { message: this.i18nService.t('info.PROFILE_UPDATED'), ...profile };
  }

  async sendVerificationOtp({ email, phone_number }: OtpDto) {
    const recipient = email ? email : phone_number;

    await this.otpService.sendOtp(recipient);

    return { message: this.i18nService.t('info.CONFIRM_CODE_SENT') };
  }

  async updateEmail(user_id: string, { otp, email }: UpdateEmailDto) {
    await this.otpService.verifyOtp(otp, email);

    const existingEmail = await this.userRepository.findOne({
      where: { email },
    });
    if (existingEmail) {
      throw new ConflictException('error.USER_EMAIL_EXIST');
    }
    await this.userRepository.update(user_id, { email });
    const profile = await this.getProfile(user_id);
    return { message: this.i18nService.t('info.PROFILE_UPDATED'), ...profile };
  }

  async updatePhoneNumber(user_id: string, { otp, phone_number }: UpdatePhoneNumberDto) {
    await this.otpService.verifyOtp(otp, phone_number);

    const existingPhoneNumber = await this.userRepository.findOne({
      where: { phone_number },
    });

    if (existingPhoneNumber) {
      throw new ConflictException('error.USER_PHONE_EXIST');
    }
    await this.userRepository.update(user_id, { phone_number });
    const profile = await this.getProfile(user_id);
    return { message: this.i18nService.t('info.PROFILE_UPDATED'), ...profile };
  }

  async updateAvatar(user_id: string, file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('No file uploaded', 400);
    }
    const user = await this.userRepository.findOne({ where: { id: user_id } });

    if (user.avatar_url) {
      await this.s3Service.deleteDirectory(`avatars/${user_id}`);
      await this.setAvatar(user_id, file);
    } else {
      await this.setAvatar(user_id, file);
    }
    const profile = await this.getProfile(user_id);

    return { message: this.i18nService.t('info.PROFILE_AVATAR_UPDATED'), ...profile };
  }

  async removeAvatar(user_id: string) {
    const user = await this.userRepository.findOne({ where: { id: user_id } });
    await this.s3Service.deleteDirectory(`avatars/${user.id}`);
    await this.userRepository.update(user.id, { avatar_url: '' });
    return { message: this.i18nService.t('info.PROFILE_AVATAR_DELETED') };
  }

  async setAvatar(user_id: string, file: Express.Multer.File) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: user_id },
      });
      const fileExtension = extname(file.originalname).toLowerCase();

      const avatar_url = await this.s3Service.uploadFile(file, `avatars/${user.id}`, `avatar${fileExtension}`);
      await this.userRepository.update(user.id, {
        avatar_url: `${avatar_url}?${Date.now()}`,
      });
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  async createToken(user: User, deviceInfo: DeviceInfo) {
    return await this.tokenService.generateTokens(user, deviceInfo);
  }

  async refresh_token(user: any, deviceInfo: DeviceInfo) {
    return await this.tokenService.refreshToken(user.refresh_token, deviceInfo);
  }

  async logout(request: Request) {
    return await this.tokenService.revokeTokenByRequest(request);
  }

  private createSocialCallbackUrl(access_token: string, refresh_token: string, provider: SocialLoginProvider) {
    const redirectUrl = this.configService.getOrThrow<string>('SOCIAL_AUTH_FRONT_END_CALLBACK_URL');
    return `${redirectUrl}?access_token=${access_token}&refresh_token=${refresh_token}&provider=${provider}`;
  }

  /**
   * Get user roles with caching
   */
  async getUserRoles(userId: string): Promise<string[]> {
    const cacheKey = this.cacheService.getUserRolesCacheKey(userId);

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const user = await this.userRepository.findOne({
          where: { id: userId },
          relations: ['roles'],
        });

        if (!user) {
          return [];
        }

        return user.roles?.map((role) => role.name) || [];
      },
      300 // 5 minutes cache
    );
  }

  /**
   * Get user permissions with caching
   */
  async getUserPermissions(userId: string): Promise<string[]> {
    const cacheKey = this.cacheService.getUserPermissionsCacheKey(userId);

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const user = await this.userRepository.findOne({
          where: { id: userId },
          relations: ['roles', 'roles.permissions'],
        });

        if (!user) {
          return [];
        }

        const permissions = user.roles?.flatMap((role) => role.permissions?.map((p) => p.name) || []) || [];

        return [...new Set(permissions)]; // Remove duplicates
      },
      300 // 5 minutes cache
    );
  }
}
