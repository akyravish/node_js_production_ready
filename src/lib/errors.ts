/**
 * Custom error classes with error codes for better debugging and error handling
 */

export enum ErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_TOKEN = 'INVALID_TOKEN',

  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',

  // Not Found
  NOT_FOUND = 'NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',

  // Conflict
  CONFLICT = 'CONFLICT',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',

  // Server Errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // Timeout
  REQUEST_TIMEOUT = 'REQUEST_TIMEOUT',

  // Kafka
  KAFKA_ERROR = 'KAFKA_ERROR',
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: ErrorCode,
    statusCode: number = 500,
    isOperational: boolean = true,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed') {
    super(message, ErrorCode.VALIDATION_ERROR, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', code: ErrorCode = ErrorCode.NOT_FOUND) {
    super(message, code, 404);
  }
}

export class UserNotFoundError extends NotFoundError {
  constructor(message: string = 'User not found') {
    super(message, ErrorCode.USER_NOT_FOUND);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict', code: ErrorCode = ErrorCode.CONFLICT) {
    super(message, code, 409);
  }
}

export class UserAlreadyExistsError extends ConflictError {
  constructor(message: string = 'User already exists') {
    super(message, ErrorCode.USER_ALREADY_EXISTS);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, ErrorCode.UNAUTHORIZED, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, ErrorCode.FORBIDDEN, 403);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, ErrorCode.DATABASE_ERROR, 500);
  }
}

export class KafkaError extends AppError {
  constructor(message: string = 'Kafka operation failed') {
    super(message, ErrorCode.KAFKA_ERROR, 500);
  }
}
