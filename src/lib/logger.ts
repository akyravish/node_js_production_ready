import pino from 'pino';
import { config } from '../config';

const isProd = config.nodeEnv === 'production';

const usePretty = !isProd && config.logFormat !== 'json';

export const logger = pino(
  isProd
    ? {
        level: config.logLevel,
      }
    : {
        level: config.logLevel,
        transport: usePretty
          ? {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'HH:MM:ss.l',
                ignore: 'pid,hostname',
                singleLine: false,
                messageFormat: '{msg}',
                hideObject: false,
                customColors: 'info:blue,warn:yellow,error:red',
              },
            }
          : undefined,
      },
);

export default logger;
