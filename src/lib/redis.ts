import Redis from 'ioredis';
import { config } from '../config';
import logger from './logger';

const redis = new Redis(config.redisUrl, {
  maxRetriesPerRequest: null,
});

redis.on('error', (err) => {
  logger.error({ err }, 'Redis error');
});

export { redis };
