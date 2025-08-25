import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CookieOptions, Response } from 'express';

@Injectable()
export class CookieService {
  maxAge: number;
  expires: Date;

  constructor(private configService: ConfigService) {
    const today = new Date();
    const oneYearLater = new Date(today);
    oneYearLater.setFullYear(today.getFullYear() + 1);
    this.maxAge = oneYearLater.getTime();
    this.expires = oneYearLater;
  }

  setCookieOptions(): CookieOptions {
    const env = this.configService.getOrThrow<string>('NODE_ENV') ?? 'development';
    const isProduction = env === 'production';
    const domain = this.configService.getOrThrow<string>('APP_DOMAIN_WILDCARD');

    const cookieOptions: CookieOptions = {
      priority: 'high',
      path: '/', // برای تمام مسیرها در تمام subdomains
      maxAge: this.maxAge,
      expires: this.expires,
      httpOnly: true,
    };

    if (isProduction) {
      cookieOptions.secure = true; // 🔐 only use Secure in production
      cookieOptions.sameSite = 'lax'; // 🛡️ محافظت CSRF + اجازه cross-subdomain
      if (!domain) {
        throw new Error('APP_DOMAIN_WILDCARD is not defined in the environment');
      }
      cookieOptions.domain = domain; // .radioscript.live
    } else {
      cookieOptions.secure = false; // ❌ Allow HTTP for localhost
      cookieOptions.sameSite = 'lax'; // 🛡️ محافظت CSRF + اجازه cross-subdomain
      // ⚠ Do not set domain in dev or localhost will reject the cookie
    }

    return cookieOptions;
  }

  async setResponseTokenCookies(res: Response, access_token: string, refresh_token: string) {
    const cookieOptions = this.setCookieOptions();
    res.cookie('access_token', access_token, cookieOptions);
    res.cookie('refresh_token', refresh_token, cookieOptions);
  }

  async deleteResponseTokenCookies(res: Response) {
    const deleteOptions: CookieOptions = this.setCookieOptions();
    res.clearCookie('access_token', deleteOptions);
    res.clearCookie('refresh_token', deleteOptions);
  }
}
