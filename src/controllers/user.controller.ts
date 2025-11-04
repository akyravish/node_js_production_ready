/**
 * CONTROLLERS FOLDER
 *
 * Purpose: Request handlers that receive HTTP requests, validate input, call services,
 * and return HTTP responses. Controllers should be thin - they handle HTTP concerns
 * (status codes, headers, request/response formatting) and delegate business logic to services.
 *
 * Best Practices:
 * - One controller per resource/domain
 * - Use schemas for request validation
 * - Call service layer for business logic
 * - Return appropriate HTTP status codes
 * - Handle errors (middleware will catch them)
 */

import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { AuthedRequest } from '../middleware/auth';
import { RequestWithId } from '../middleware/requestId';
import { ValidationError, UnauthorizedError } from '../lib/errors';
import { createUserSchema, updateUserSchema } from '../schemas/user.schema';
import * as userService from '../services/user.service';
import { sendSuccess, sendError, getRequestId } from '../utils/response';

/**
 * Create a new user
 * POST /api/v1/users
 */
export async function createUser(req: Request & RequestWithId, res: Response): Promise<Response> {
  try {
    const validatedData = createUserSchema.parse(req.body);
    const user = await userService.createUser(validatedData);
    const requestId = getRequestId(req);
    return sendSuccess(
      res,
      user,
      201,
      'User created successfully',
      requestId ? { requestId } : undefined,
    );
  } catch (error) {
    const requestId = getRequestId(req);

    if (error instanceof ZodError) {
      const validationError = new ValidationError('Validation failed');
      return sendError(res, validationError, requestId, {
        errors: error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        })),
      });
    }

    return sendError(res, error instanceof Error ? error : new Error('Unknown error'), requestId);
  }
}

/**
 * Get current authenticated user
 * GET /api/v1/users/me
 */
export async function getCurrentUser(
  req: AuthedRequest & RequestWithId,
  res: Response,
): Promise<Response> {
  try {
    if (!req.user) {
      const unauthorizedError = new UnauthorizedError('Authentication required');
      const requestId = getRequestId(req);
      return sendError(res, unauthorizedError, requestId);
    }

    const user = await userService.getUserById(req.user.id);
    const requestId = getRequestId(req);
    return sendSuccess(
      res,
      user,
      200,
      'User retrieved successfully',
      requestId ? { requestId } : undefined,
    );
  } catch (error) {
    const requestId = getRequestId(req);
    return sendError(res, error instanceof Error ? error : new Error('Unknown error'), requestId);
  }
}

/**
 * Update user profile
 * PATCH /api/v1/users/me
 */
export async function updateUser(
  req: AuthedRequest & RequestWithId,
  res: Response,
): Promise<Response> {
  try {
    if (!req.user) {
      const unauthorizedError = new UnauthorizedError('Authentication required');
      const requestId = getRequestId(req);
      return sendError(res, unauthorizedError, requestId);
    }

    const validatedData = updateUserSchema.parse(req.body);
    const user = await userService.updateUser(req.user.id, validatedData);
    const requestId = getRequestId(req);
    return sendSuccess(
      res,
      user,
      200,
      'User updated successfully',
      requestId ? { requestId } : undefined,
    );
  } catch (error) {
    const requestId = getRequestId(req);

    if (error instanceof ZodError) {
      const validationError = new ValidationError('Validation failed');
      return sendError(res, validationError, requestId, {
        errors: error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        })),
      });
    }

    return sendError(res, error instanceof Error ? error : new Error('Unknown error'), requestId);
  }
}
