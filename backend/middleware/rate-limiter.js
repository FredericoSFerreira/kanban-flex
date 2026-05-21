import { getRedisClient } from "../service/redis-service.js";

export const rateLimiter = (maxRequests = 10, windowMs = 60000, keyPrefix = 'ratelimit') => {
  return async (req, res, next) => {
    try {
      const identifier = req.user?.id || req.user?.email || req.ip;
      const key = `${keyPrefix}:${req.originalUrl}:${identifier}`;
      const client = await getRedisClient();

      // Use atomic INCR to avoid race conditions between get/set
      const currentCount = await client.incr(key);

      if (currentCount === 1) {
        await client.expire(key, Math.ceil(windowMs / 1000));
      }

      const ttl = await client.ttl(key);
      const remaining = Math.max(0, maxRequests - currentCount);

      res.setHeader('X-RateLimit-Limit', String(maxRequests));
      res.setHeader('X-RateLimit-Remaining', String(remaining));

      if (currentCount > maxRequests) {
        const retryAfter = Math.max(ttl, 1);
        res.setHeader('Retry-After', String(retryAfter));
        return res.status(429).json({
          error: 'Too many requests, please try again later.'
        });
      }

      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      next();
    }
  };
};
