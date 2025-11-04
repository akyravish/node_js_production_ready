import { NextFunction, Request, Response } from 'express';
import { extractTokenFromCookie, prisma, verifyJwt } from '../lib';

export interface AuthedRequest extends Request {
  user?: {
    id: string;
  };
}

export async function authMiddleware(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const token = extractTokenFromCookie(req);
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const payload = verifyJwt(token);
    if (!payload || !payload.sub) return res.status(401).json({ error: 'Invalid token' });

    // Optionally fetch user and attach minimal info
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return res.status(401).json({ error: 'Invalid token (user not found)' });

    req.user = { id: user.id };
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}
