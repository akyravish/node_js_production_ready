/**
 * SCHEMAS FOLDER
 *
 * Purpose: Request/response validation schemas using Zod. These schemas validate
 * and type-check incoming data before it reaches controllers or services.
 *
 * Best Practices:
 * - One schema file per resource/domain
 * - Use Zod for runtime validation
 * - Define both input and output schemas
 * - Export TypeScript types inferred from schemas
 * - Use for API request validation
 */

import { z } from 'zod';

/**
 * Schema for creating a user
 */
export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

/**
 * Schema for updating a user
 */
export const updateUserSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    email: z.string().email().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

/**
 * Schema for query parameters (e.g., pagination)
 */
export const getUserQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
});

/**
 * Schema for path parameters
 */
export const userIdParamSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
});

// Type exports for use in controllers/services
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type GetUserQuery = z.infer<typeof getUserQuerySchema>;
export type UserIdParam = z.infer<typeof userIdParamSchema>;
