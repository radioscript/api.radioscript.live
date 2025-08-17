import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === 'production';

        if (isProduction || configService.get('REDIS_HOST')) {
          // Use Redis in production or when Redis is configured
          return {
            store: redisStore as any,
            host: configService.get('REDIS_HOST', 'localhost'),
            port: configService.get('REDIS_PORT', 6379),
            password: configService.get('REDIS_PASSWORD'),
            db: configService.get('REDIS_DB', 0),
            ttl: configService.get('CACHE_TTL', 300), // 5 minutes default
            max: configService.get('CACHE_MAX_ITEMS', 1000),
          };
        } else {
          // Use in-memory cache for development
          return {
            ttl: configService.get('CACHE_TTL', 300), // 5 minutes default
            max: configService.get('CACHE_MAX_ITEMS', 100),
          };
        }
      },
    }),
  ],
  providers: [CacheService],
  exports: [CacheService, NestCacheModule],
})
export class CacheModule {}
