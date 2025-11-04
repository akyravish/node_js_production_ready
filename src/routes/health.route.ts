import express from 'express';
import { logger, prisma, redis } from '../lib';

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    await redis.ping();
    return res.json({
      status: 'ok',
      database: 'connected',
      redis: 'connected',
    });
  } catch (err) {
    logger.error({ err }, 'health check failed');
    return res.status(500).json({ status: 'error' });
  }
}) as express.RequestHandler;

export default router;
