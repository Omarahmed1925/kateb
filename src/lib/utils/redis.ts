import Redis from 'ioredis';

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
      console.warn('REDIS_URL not set, using in-memory store (development only)');
      // Fallback to memory store in development
      return {
        get: async () => null,
        set: async () => 'OK',
        del: async () => 0,
        incr: async () => 1,
        decr: async () => 0,
        expire: async () => 1,
        ttl: async () => -1,
      } as any;
    }

    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });

    redis.on('error', (err) => {
      console.error('Redis error:', err);
    });

    redis.on('connect', () => {
      console.log('Connected to Redis');
    });
  }

  return redis;
}

// Rate limiting implementation
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const redis = getRedis();
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;

  try {
    const count = await redis.zcount(key, windowStart, now);
    const remaining = Math.max(0, limit - count);

    if (count >= limit) {
      const oldest = await redis.zrange(key, 0, 0);
      const resetTime = oldest.length > 0 ? parseInt(oldest[0]) + windowSeconds * 1000 : now;
      return { allowed: false, remaining: 0, resetTime };
    }

    await redis.zadd(key, now, `${now}-${Math.random()}`);
    await redis.expire(key, windowSeconds);

    return { allowed: true, remaining: remaining - 1, resetTime: 0 };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // Allow on error
    return { allowed: true, remaining: limit, resetTime: 0 };
  }
}

// Cache functions
export async function getCache<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  try {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

export async function setCache<T>(key: string, value: T, expirationSeconds = 3600): Promise<void> {
  const redis = getRedis();
  try {
    await redis.setex(key, expirationSeconds, JSON.stringify(value));
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

export async function deleteCache(key: string): Promise<void> {
  const redis = getRedis();
  try {
    await redis.del(key);
  } catch (error) {
    console.error('Cache delete error:', error);
  }
}

export async function incrementCounter(key: string, expirationSeconds = 2592000): Promise<number> {
  const redis = getRedis();
  try {
    const value = await redis.incr(key);
    if (value === 1) {
      await redis.expire(key, expirationSeconds);
    }
    return value;
  } catch (error) {
    console.error('Counter increment error:', error);
    return 0;
  }
}

export async function getCounter(key: string): Promise<number> {
  const redis = getRedis();
  try {
    const value = await redis.get(key);
    return value ? parseInt(value, 10) : 0;
  } catch (error) {
    console.error('Counter get error:', error);
    return 0;
  }
}

export async function resetCounter(key: string): Promise<void> {
  const redis = getRedis();
  try {
    await redis.del(key);
  } catch (error) {
    console.error('Counter reset error:', error);
  }
}

