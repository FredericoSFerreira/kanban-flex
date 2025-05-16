import { getRedisClient } from "../service/redis-service.js";
import {parseBoolean} from "../utils.js";

export const rateLimiter = (maxRequests = 10, windowMs = 60000, keyPrefix = 'ratelimit') => {
  return async (req, res, next) => {
    try {
      if (!parseBoolean(req.query.retry)) {
        console.log('Ignore rate limit')
        return next()
      }
      console.log('Apply rate limit')
      const identifier = req.user?.id || req.ip;
      const key = `${keyPrefix}:${req.originalUrl}:${identifier}`;
      const client = await getRedisClient();
      const currentCount = await client.get(key);

      if (currentCount && parseInt(currentCount) >= maxRequests) {
        return res.status(429).json({
          error: 'Too many requests, please try again later.',
          retryAfter: Math.ceil(windowMs / 1000) // in seconds
        });
      }

      if (currentCount) {
        await client.incr(key);
      } else {
        await client.setEx(key, Math.ceil(windowMs / 1000), '1');
      }

      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      next();
    }
  };
};
