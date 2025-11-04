import { NextFunction, Request, Response } from 'express';
import { config } from '../config';

export function timeoutMiddleware(req: Request, res: Response, next: NextFunction): void {
  const timeoutMs = config.requestTimeoutMs;

  // Store timeout reference to clear it later
  let timeoutId: NodeJS.Timeout | null = null;

  // Set timeout on the request socket to properly abort the connection
  req.setTimeout(timeoutMs, () => {
    if (!res.headersSent) {
      res.status(408).json({
        error: 'Request timeout',
        code: 'REQUEST_TIMEOUT',
      });
    }
    // Destroy the request socket to abort ongoing operations
    if (req.socket && !req.socket.destroyed) {
      req.socket.destroy();
    }
  });

  // Also set a backup timeout using setTimeout
  timeoutId = setTimeout(() => {
    if (!res.headersSent) {
      res.status(408).json({
        error: 'Request timeout',
        code: 'REQUEST_TIMEOUT',
      });
    }
    if (req.socket && !req.socket.destroyed) {
      req.socket.destroy();
    }
  }, timeoutMs);

  // Clear timeout when response finishes
  res.on('finish', () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    req.setTimeout(0); // Clear request timeout
  });
  res.on('close', () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    req.setTimeout(0); // Clear request timeout
  });

  next();
}
