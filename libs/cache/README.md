# Cache Library

This library provides comprehensive caching functionality for the Radio Script API using Redis and in-memory cache as fallback.

## Features

- **Redis Integration**: Production-ready Redis caching
- **In-Memory Fallback**: Development mode with in-memory cache
- **Smart Key Management**: Predefined cache key patterns
- **Cache Invalidation**: Targeted cache clearing
- **Error Handling**: Graceful fallback when cache fails

## Configuration

### Environment Variables

```env
# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Cache Configuration
CACHE_TTL=300          # Default TTL in seconds (5 minutes)
CACHE_MAX_ITEMS=1000   # Maximum items in cache

NODE_ENV=production    # Use Redis in production, in-memory in development
```

### Docker Setup

Redis is automatically included in Docker Compose:

```yaml
redis:
  image: redis:7-alpine
  container_name: radio-script-redis
  restart: unless-stopped
  ports:
    - '6379:6379'
  volumes:
    - redis_data:/data
```

## Usage

### Basic Operations

```typescript
import { CacheService } from '@/cache';

@Injectable()
export class MyService {
  constructor(private cacheService: CacheService) {}

  async getData(id: string) {
    // Get from cache
    const cached = await this.cacheService.get(`data:${id}`);
    if (cached) return cached;

    // Fetch from database
    const data = await this.fetchFromDB(id);

    // Store in cache for 5 minutes
    await this.cacheService.set(`data:${id}`, data, 300);

    return data;
  }
}
```

### Get or Set Pattern

```typescript
async getData(id: string) {
  return this.cacheService.getOrSet(
    `data:${id}`,
    async () => await this.fetchFromDB(id),
    300 // TTL in seconds
  );
}
```

### Predefined Key Patterns

```typescript
// User cache keys
const userKey = this.cacheService.getUserCacheKey(userId);
const rolesKey = this.cacheService.getUserRolesCacheKey(userId);
const permissionsKey = this.cacheService.getUserPermissionsCacheKey(userId);

// Content cache keys
const postKey = this.cacheService.getPostCacheKey(postId);
const categoryKey = this.cacheService.getCategoryCacheKey(categoryId);
const allCategoriesKey = this.cacheService.getCategoryCacheKey(); // for all categories
```

### Cache Invalidation

```typescript
// Invalidate specific user cache
await this.cacheService.invalidateUserCache(userId);

// Invalidate content cache
await this.cacheService.invalidateContentCache();

// Manual cache operations
await this.cacheService.del('specific:key');
await this.cacheService.reset(); // Clear all cache
```

## Integration Examples

### RBAC Service Caching

```typescript
async getUserRoles(userId: string): Promise<Role[]> {
  const cacheKey = this.cacheService.getUserRolesCacheKey(userId);

  return this.cacheService.getOrSet(
    cacheKey,
    async () => {
      // Database query
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['roles', 'roles.permissions'],
      });
      return user.roles || [];
    },
    300 // 5 minutes cache
  );
}
```

### Automatic Cache Invalidation

```typescript
async assignRoleToUser(userId: string, roleId: string) {
  // Assign role logic...
  await this.userRepository.save(user);

  // Invalidate related cache
  await this.cacheService.invalidateUserCache(userId);
}
```

## Cache Strategies

### 1. Cache-Aside (Lazy Loading)

- Check cache first
- Load from database if miss
- Update cache with result

### 2. Write-Through

- Update database and cache simultaneously
- Used for critical data consistency

### 3. Write-Behind

- Update cache immediately
- Update database asynchronously
- Better performance but eventual consistency

## Performance Benefits

- **Reduced Database Load**: Frequent queries cached
- **Faster Response Times**: In-memory access vs database queries
- **Scalability**: Better handling of concurrent requests
- **Cost Efficiency**: Reduced database resource usage

## Monitoring

### Cache Hit Rates

Monitor cache effectiveness:

```typescript
// Add metrics in your service
let hits = 0;
let misses = 0;

async get(key: string) {
  const result = await this.cacheService.get(key);
  if (result) hits++;
  else misses++;

  // Log hit rate periodically
  console.log(`Cache hit rate: ${hits / (hits + misses) * 100}%`);

  return result;
}
```

## Best Practices

1. **Set Appropriate TTL**: Balance freshness vs performance
2. **Use Consistent Key Patterns**: Easier cache management
3. **Handle Cache Failures**: Always have fallback logic
4. **Invalidate Strategically**: Clear related cache on updates
5. **Monitor Performance**: Track hit rates and response times

## Troubleshooting

### Common Issues

1. **Cache Not Working**

   - Check Redis connection
   - Verify environment variables
   - Check Docker container status

2. **Stale Data**

   - Implement proper cache invalidation
   - Reduce TTL for frequently changing data

3. **Memory Issues**
   - Set appropriate `CACHE_MAX_ITEMS`
   - Monitor Redis memory usage
   - Implement cache eviction policies

### Development vs Production

- **Development**: Uses in-memory cache (no Redis required)
- **Production**: Uses Redis for shared cache across instances
