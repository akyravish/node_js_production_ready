import { Request } from 'express';
import { extractTokenFromCookie, extractTokenFromHeader, extractTokenFromRequest, signJwt, verifyJwt, verifyJwtFromRequest } from '../../../src/lib/jwt';
import { config } from '../../../src/config';

describe('JWT utilities', () => {
  const testPayload = { sub: 'test-user-id' };

  describe('signJwt', () => {
    it('should generate a valid JWT token', () => {
      const token = signJwt(testPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    it('should generate different tokens for different payloads', () => {
      const token1 = signJwt({ sub: 'user1' });
      const token2 = signJwt({ sub: 'user2' });
      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyJwt', () => {
    it('should verify a valid token', () => {
      const token = signJwt(testPayload);
      const decoded = verifyJwt(token);
      expect(decoded).not.toBeNull();
      expect(decoded?.sub).toBe(testPayload.sub);
    });

    it('should return null for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      const result = verifyJwt(invalidToken);
      expect(result).toBeNull();
    });

    it('should return null for malformed token', () => {
      const malformedToken = 'not-a-jwt-token';
      const result = verifyJwt(malformedToken);
      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const result = verifyJwt('');
      expect(result).toBeNull();
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from Authorization header', () => {
      const req = {
        headers: {
          authorization: 'Bearer test-token-123',
        },
      } as Request;

      const token = extractTokenFromHeader(req);
      expect(token).toBe('test-token-123');
    });

    it('should return null if Authorization header is missing', () => {
      const req = {
        headers: {},
      } as Request;

      const token = extractTokenFromHeader(req);
      expect(token).toBeNull();
    });

    it('should return null if Bearer prefix is missing', () => {
      const req = {
        headers: {
          authorization: 'test-token-123',
        },
      } as Request;

      const token = extractTokenFromHeader(req);
      expect(token).toBeNull();
    });

    it('should return null for malformed Authorization header', () => {
      const req = {
        headers: {
          authorization: 'Bearer token1 token2',
        },
      } as Request;

      const token = extractTokenFromHeader(req);
      expect(token).toBeNull();
    });
  });

  describe('extractTokenFromCookie', () => {
    it('should extract token from cookie', () => {
      const req = {
        cookies: {
          [config.jwt.cookieName]: 'cookie-token-123',
        },
      } as Request;

      const token = extractTokenFromCookie(req);
      expect(token).toBe('cookie-token-123');
    });

    it('should return null if cookie is missing', () => {
      const req = {
        cookies: {},
      } as Request;

      const token = extractTokenFromCookie(req);
      expect(token).toBeNull();
    });

    it('should return null if cookies object is undefined', () => {
      const req = {} as Request;
      const token = extractTokenFromCookie(req);
      expect(token).toBeNull();
    });
  });

  describe('extractTokenFromRequest', () => {
    it('should prefer header token over cookie token', () => {
      const req = {
        headers: {
          authorization: 'Bearer header-token',
        },
        cookies: {
          [config.jwt.cookieName]: 'cookie-token',
        },
      } as Request;

      const token = extractTokenFromRequest(req);
      expect(token).toBe('header-token');
    });

    it('should fallback to cookie token if header is missing', () => {
      const req = {
        headers: {},
        cookies: {
          [config.jwt.cookieName]: 'cookie-token',
        },
      } as Request;

      const token = extractTokenFromRequest(req);
      expect(token).toBe('cookie-token');
    });

    it('should return null if neither header nor cookie has token', () => {
      const req = {
        headers: {},
        cookies: {},
      } as Request;

      const token = extractTokenFromRequest(req);
      expect(token).toBeNull();
    });
  });

  describe('verifyJwtFromRequest', () => {
    it('should verify token from request', () => {
      const token = signJwt(testPayload);
      const req = {
        headers: {
          authorization: `Bearer ${token}`,
        },
        cookies: {},
      } as Request;

      const decoded = verifyJwtFromRequest(req);
      expect(decoded).not.toBeNull();
      expect(decoded?.sub).toBe(testPayload.sub);
    });

    it('should return null if no token in request', () => {
      const req = {
        headers: {},
        cookies: {},
      } as Request;

      const result = verifyJwtFromRequest(req);
      expect(result).toBeNull();
    });

    it('should return null for invalid token in request', () => {
      const req = {
        headers: {
          authorization: 'Bearer invalid-token',
        },
        cookies: {},
      } as Request;

      const result = verifyJwtFromRequest(req);
      expect(result).toBeNull();
    });
  });
});
