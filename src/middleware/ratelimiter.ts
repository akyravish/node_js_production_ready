import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { config } from '../config';
import { redis } from '../lib';

export const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    client: redis,
  }),
});

/**
 * Create a per-route rate limiter with custom limits
 * @param windowMs Time window in milliseconds
 * @param max Maximum number of requests per window
 * @returns Rate limiter middleware
 */
export function createRateLimiter(windowMs: number, max: number) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
      client: redis,
    }),
    message: 'Too many requests from this IP, please try again later.',
  });
}
