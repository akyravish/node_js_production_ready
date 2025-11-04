import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export type JwtPayload = {
  sub: string;
  iat?: number;
  exp?: number;
};

export function signJwt(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, config.jwt.secret, {
    algorithm: 'HS256',
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);
}

export function verifyJwt(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, config.jwt.secret, { algorithms: ['HS256'] });
    return decoded as JwtPayload;
  } catch (err) {
    return null;
  }
}

export function extractTokenFromHeader(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

export function extractTokenFromCookie(req: Request): string | null {
  const token = req.cookies?.[config.jwt.cookieName];
  return token || null;
}

export function extractTokenFromRequest(req: Request): string | null {
  const headerToken = extractTokenFromHeader(req);
  if (headerToken) {
    return headerToken;
  }

  const cookieToken = extractTokenFromCookie(req);
  if (cookieToken) {
    return cookieToken;
  }

  return null;
}

export function verifyJwtFromRequest(req: Request): JwtPayload | null {
  const token = extractTokenFromRequest(req);
  if (!token) {
    return null;
  }

  return verifyJwt(token);
}
