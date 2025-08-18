import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      return await this.cacheManager.get<T>(key);
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  }

  /**
   * Delete value from cache
   */
  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
    }
  }

  /**
   * Clear all cache
   */
  async reset(): Promise<void> {
    try {
      // Type assertion for reset method
      const manager = this.cacheManager as any;
      if (typeof manager.reset === 'function') {
        await manager.reset();
      } else {
        console.warn('Cache reset method not available');
      }
    } catch (error) {
      console.error('Cache reset error:', error);
    }
  }

  /**
   * Generate cache key for user
   */
  getUserCacheKey(userId: string, suffix: string = ''): string {
    return `user:${userId}${suffix ? `:${suffix}` : ''}`;
  }

  /**
   * Generate cache key for user roles
   */
  getUserRolesCacheKey(userId: string): string {
    return this.getUserCacheKey(userId, 'roles');
  }

  /**
   * Generate cache key for user permissions
   */
  getUserPermissionsCacheKey(userId: string): string {
    return this.getUserCacheKey(userId, 'permissions');
  }

  /**
   * Generate cache key for posts
   */
  getPostCacheKey(postId: string): string {
    return `post:${postId}`;
  }

  /**
   * Generate cache key for categories
   */
  getCategoryCacheKey(categoryId?: string): string {
    return categoryId ? `category:${categoryId}` : 'categories:all';
  }

  /**
   * Generate cache key for tags
   */
  getTagCacheKey(tagId?: string): string {
    return tagId ? `tag:${tagId}` : 'tags:all';
  }

  /**
   * Invalidate user-related cache
   */
  async invalidateUserCache(userId: string): Promise<void> {
    const keys = [this.getUserCacheKey(userId), this.getUserRolesCacheKey(userId), this.getUserPermissionsCacheKey(userId)];

    await Promise.all(keys.map((key) => this.del(key)));
  }

  /**
   * Invalidate content cache (posts, categories, tags)
   */
  async invalidateContentCache(): Promise<void> {
    const keys = ['categories:all', 'tags:all', 'posts:featured', 'posts:recent'];

    await Promise.all(keys.map((key) => this.del(key)));
  }

  /**
   * Get or set pattern - useful for caching expensive operations
   */
  async getOrSet<T>(key: string, factory: () => Promise<T>, ttl?: number): Promise<T> {
    let result = await this.get<T>(key);

    if (result === null || result === undefined) {
      result = await factory();
      await this.set(key, result, ttl);
    }

    return result;
  }
}
