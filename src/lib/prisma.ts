import { PrismaClient } from '@prisma/client';
import { config } from '../config';

const prisma = new PrismaClient({
  log: config.nodeEnv === 'production' ? ['error'] : ['error', 'warn', 'info'],
  errorFormat: config.nodeEnv === 'production' ? 'minimal' : 'pretty',
});

export { prisma };
