import { Request, Response } from 'express';
import { sanitizeMiddleware } from '../../../src/middleware/sanitize';
import logger from '../../../src/lib/logger';

// Mock logger
jest.mock('../../../src/lib/logger', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
}));

describe('sanitizeMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockNext = jest.fn();
    mockRequest = {
      query: {},
      body: {},
      params: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  it('should sanitize query parameters', () => {
    mockRequest.query = {
      search: '  test  ',
      value: 'test-value',
    };

    sanitizeMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(mockRequest.query).toEqual({
      search: 'test',
      value: 'test-value',
    });
    expect(mockNext).toHaveBeenCalled();
  });

  it('should sanitize body parameters', () => {
    mockRequest.body = {
      name: '  John Doe  ',
      description: 'Some content',
    };

    sanitizeMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(mockRequest.body).toEqual({
      name: 'John Doe',
      description: 'Some content',
    });
    expect(mockNext).toHaveBeenCalled();
  });

  it('should sanitize route parameters', () => {
    mockRequest.params = {
      id: '  user-123  ',
      slug: 'test-slug',
    };

    sanitizeMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(mockRequest.params).toEqual({
      id: 'user-123',
      slug: 'test-slug',
    });
    expect(mockNext).toHaveBeenCalled();
  });

  it('should handle empty objects', () => {
    mockRequest.query = {};
    mockRequest.body = {};
    mockRequest.params = {};

    sanitizeMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(mockNext).toHaveBeenCalled();
  });

  it('should handle nested objects', () => {
    mockRequest.body = {
      user: {
        name: '  Test  ',
        email: 'test@example.com',
      },
      tags: ['  tag1  ', '  tag2  '],
    };

    sanitizeMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(mockRequest.body).toEqual({
      user: {
        name: 'Test',
        email: 'test@example.com',
      },
      tags: ['tag1', 'tag2'],
    });
    expect(mockNext).toHaveBeenCalled();
  });

  it('should handle null and undefined values', () => {
    mockRequest.body = {
      value: null,
      undefinedValue: undefined,
      emptyString: '',
    };

    sanitizeMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(mockRequest.body).toHaveProperty('value', null);
    expect(mockNext).toHaveBeenCalled();
  });
});
