import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { CookieOptions } from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import { config } from './config';
import { disconnectKafka, initKafka, prisma, redis } from './lib';
import logger from './lib/logger';
import {
  errorHandler,
  limiter,
  requestIdMiddleware,
  sanitizeMiddleware,
  timeoutMiddleware,
} from './middleware';
import router from './routes';

async function main() {
  const app = express();

  app.disable('x-powered-by');

  // Enforce HTTPS and trust proxy in production
  if (config.nodeEnv === 'production') {
    app.enable('trust proxy');
    app.use((req, res, next) => {
      const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol;
      if (proto !== 'https') {
        // Validate host header to prevent host header injection
        const host = req.headers.host;
        if (!host || typeof host !== 'string') {
          return res.status(400).json({ error: 'Invalid host header' });
        }
        // Whitelist valid host patterns (adjust based on your domain)
        const validHostPattern = /^[a-zA-Z0-9.-]+(:\d+)?$/;
        if (!validHostPattern.test(host)) {
          return res.status(400).json({ error: 'Invalid host header format' });
        }
        // Ensure host doesn't contain protocol or path
        const sanitizedHost = host.split('/')[0].split('?')[0].split('#')[0];
        const url = `https://${sanitizedHost}${req.originalUrl}`;
        return res.redirect(301, url);
      }
      next();
    });
  }

  // Helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
      hsts:
        config.nodeEnv === 'production'
          ? { maxAge: 15552000, includeSubDomains: true, preload: true }
          : false,
      referrerPolicy: { policy: 'no-referrer' },
      crossOriginOpenerPolicy: { policy: 'same-origin' },
      crossOriginResourcePolicy: { policy: 'same-origin' },
      xContentTypeOptions: true,
      xFrameOptions: { action: 'deny' },
    }),
  );

  app.use(
    cors({
      origin: true, // tighten in prod to known origins
      credentials: true,
    }),
  );
  // Compression middleware
  app.use(compression());

  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ limit: '10kb', extended: true }));
  app.use(cookieParser());
  app.use(hpp());

  // Request ID middleware
  app.use(requestIdMiddleware);

  // Request timeout middleware
  app.use(timeoutMiddleware);

  app.use(sanitizeMiddleware);

  // Additional security headers
  app.use((req, res, next) => {
    // Permissions-Policy header (replaces Feature-Policy)
    res.setHeader(
      'Permissions-Policy',
      'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
    );
    next();
  });

  // Cookie hardening: set secure defaults for all cookies set by the app
  app.use((req, res, next) => {
    const originalCookie = res.cookie.bind(res);
    res.cookie = (name: string, value: unknown, options: CookieOptions = {}) => {
      return originalCookie(name, value, {
        httpOnly: true,
        sameSite: 'lax',
        secure: config.nodeEnv === 'production' ? true : false,
        ...options,
      });
    };
    next();
  });
  app.use(limiter);

  // Routes
  app.use('/api/v1', router);

  // Global error handler
  app.use(errorHandler);

  // Start Kafka and other clients
  try {
    await initKafka();
    logger.info('Kafka initialized');
  } catch (err) {
    logger.warn({ err }, 'Kafka init failed (dev?), continuing');
  }

  const port = config.port;
  const host = config.host;
  app.listen(port, host, () => {
    logger.info({ host, port }, 'Server listening');
  });

  // Graceful shutdown
  const shutdown = async () => {
    logger.info('Shutting down...');
    try {
      await Promise.all([prisma.$disconnect(), redis.quit(), disconnectKafka()]);
      logger.info('All connections closed');
      process.exit(0);
    } catch (err) {
      logger.error({ err }, 'Error during shutdown');
      process.exit(1);
    }
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  logger.fatal({ err }, 'Failed to start');
  process.exit(1);
});
