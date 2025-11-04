import express from 'express';
import { config } from '../config';
import { AppError, ErrorCode } from '../lib/errors';
import logger from '../lib/logger';
import { RequestWithId } from './requestId';

// Fields that should never be logged for security
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'secret',
  'authorization',
  'cookie',
  'creditCard',
  'cvv',
  'ssn',
  'apiKey',
  'accessToken',
  'refreshToken',
];

type SanitizableValue = unknown;

function sanitizeObject(obj: SanitizableValue, depth = 0): SanitizableValue {
  if (depth > 5) return '[Max depth reached]'; // Prevent infinite recursion
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (obj instanceof Error) {
    // Only include error message and name, not stack trace in production
    if (config.nodeEnv === 'production') {
      return { name: obj.name, message: obj.message };
    }
    return { name: obj.name, message: obj.message, stack: obj.stack };
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item, depth + 1));
  }

  const sanitized: Record<string, SanitizableValue> = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_FIELDS.some((field) => lowerKey.includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = sanitizeObject(value, depth + 1);
    }
  }
  return sanitized;
}

export function errorHandler(
  err: Error & { status?: number },
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  const requestId = (req as RequestWithId).requestId;
  const sanitizedErr = sanitizeObject(err);
  const sanitizedReq = {
    method: req.method,
    path: req.path,
    query: sanitizeObject(req.query),
    // Don't log request body in error logs to avoid sensitive data
    headers: sanitizeObject(req.headers),
    requestId,
  };

  logger.error({ err: sanitizedErr, req: sanitizedReq }, 'Unhandled error');

  if (res.headersSent) return next(err);

  // Handle AppError with error codes
  if (err instanceof AppError) {
    const response: { error: string; code: ErrorCode; requestId?: string } = {
      error:
        config.nodeEnv === 'production' && err.statusCode >= 500
          ? 'Internal Server Error'
          : err.message,
      code: err.code,
    };

    if (requestId) {
      response.requestId = requestId;
    }

    return res.status(err.statusCode).json(response);
  }

  // Handle errors with status codes
  const status = typeof err.status === 'number' ? err.status : 500;
  const errorCode = status === 500 ? ErrorCode.INTERNAL_ERROR : ErrorCode.INTERNAL_ERROR;

  // Never expose stack traces or detailed error messages in production
  const message =
    config.nodeEnv === 'production' && status >= 500
      ? 'Internal Server Error'
      : err.message || 'Internal Server Error';

  const response: { error: string; code: ErrorCode; requestId?: string } = {
    error: message,
    code: errorCode,
  };

  if (requestId) {
    response.requestId = requestId;
  }

  return res.status(status).json(response);
}
