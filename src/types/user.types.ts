/**
 * TYPES FOLDER
 *
 * Purpose: TypeScript type definitions and interfaces shared across the application.
 * Use this for domain types, API types, and shared type utilities.
 *
 * Best Practices:
 * - One file per domain/resource
 * - Define domain entities and DTOs
 * - Use for type safety across layers
 * - Avoid duplicating Prisma types (use Prisma types when possible)
 * - Export reusable type utilities
 */

import { User } from '@prisma/client';

/**
 * User domain entity (public representation)
 * Excludes sensitive fields like passwords
 */
export type UserPublic = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Input types for service layer
 */
export type CreateUserData = {
  email: string;
  name: string;
  password: string;
};

export type UpdateUserData = {
  name?: string;
  email?: string;
};

/**
 * Utility type: Convert Prisma User to public User
 */
export function toUserPublic(user: User): UserPublic {
  return {
    id: user.id,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * API Response types
 */
export type ApiResponse<T> = {
  data: T;
  message?: string;
};

export type ApiError = {
  error: string;
  requestId?: string;
};

/**
 * Pagination types
 */
export type PaginationParams = {
  page: number;
  limit: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
