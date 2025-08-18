import { Category, Comment, Media, Meta, Otp, Permission, Post, PostMeta, Role, Tag, Token, User } from '@/entities';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // Import ConfigModule to use ConfigService
      inject: [ConfigService], // Inject ConfigService
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow<string>('DATABASE_HOST'),
        port: configService.getOrThrow<number>('DATABASE_PORT'),
        username: configService.getOrThrow<string>('DATABASE_USER'),
        password: configService.getOrThrow<string>('DATABASE_PASSWORD'),
        database: configService.getOrThrow<string>('DATABASE_NAME'),
        entities: [User, Token, Media, Meta, Otp, Post, PostMeta, Category, Tag, Comment, Role, Permission],
        synchronize: true,
        migrationsRun: true,
      }),
    }),
    TypeOrmModule.forFeature([Role, Permission]),
  ],
  controllers: [],
  providers: [SeedService],
  exports: [],
})
export class DatabaseModule {}
