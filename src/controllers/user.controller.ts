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
import { AuthedRequest } from '../middleware/auth';
import { createUserSchema, updateUserSchema } from '../schemas/user.schema';
import * as userService from '../services/user.service';

/**
 * Create a new user
 * POST /api/v1/users
 */
export async function createUser(req: Request, res: Response) {
  const validatedData = createUserSchema.parse(req.body);
  const user = await userService.createUser(validatedData);
  return res.status(201).json(user);
}

/**
 * Get current authenticated user
 * GET /api/v1/users/me
 */
export async function getCurrentUser(req: AuthedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const user = await userService.getUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json(user);
}

/**
 * Update user profile
 * PATCH /api/v1/users/me
 */
export async function updateUser(req: AuthedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const validatedData = updateUserSchema.parse(req.body);
  const user = await userService.updateUser(req.user.id, validatedData);
  return res.json(user);
}
