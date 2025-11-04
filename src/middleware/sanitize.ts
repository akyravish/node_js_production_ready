import { NextFunction, Request, Response } from 'express';
import logger from '../lib/logger';

function sanitizeString(value: string): string {
  if (typeof value !== 'string') return value;
  // Remove null bytes and trim whitespace
  return value.replace(/\0/g, '').trim();
}

type SanitizableValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | SanitizableValue[]
  | { [key: string]: SanitizableValue };

function sanitizeObject(obj: unknown): SanitizableValue {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return sanitizeString(String(obj));
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }
  const sanitized: Record<string, SanitizableValue> = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeObject(value);
  }
  return sanitized;
}

export function sanitizeMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    // Sanitize query parameters
    if (req.query && Object.keys(req.query).length > 0) {
      req.query = sanitizeObject(req.query) as typeof req.query;
    }

    // Sanitize body parameters
    if (req.body && Object.keys(req.body).length > 0) {
      req.body = sanitizeObject(req.body) as typeof req.body;
    }

    // Sanitize route parameters
    if (req.params && Object.keys(req.params).length > 0) {
      req.params = sanitizeObject(req.params) as typeof req.params;
    }

    next();
  } catch (err) {
    logger.error({ err }, 'Invalid input detected');
    res.status(400).json({ error: 'Invalid input detected' });
  }
}
