import dotenv from 'dotenv';

dotenv.config();

function required(key: string, fallback?: string): string {
  const val = process.env[key] ?? fallback;
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  host: process.env.HOST ?? '0.0.0.0',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  databaseUrl: required('DATABASE_URL'),
  redisUrl: required('REDIS_URL'),
  kafkaBrokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(','),
  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60000),
    max: Number(process.env.RATE_LIMIT_MAX ?? 100),
  },
  jwt: {
    secret: required('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
    cookieName: process.env.JWT_COOKIE_NAME ?? 'token',
  },
  requestTimeoutMs: Number(process.env.REQUEST_TIMEOUT_MS ?? 30000),
  logLevel: process.env.LOG_LEVEL ?? 'info',
  logFormat: process.env.LOG_FORMAT ?? 'json',
} as const;
