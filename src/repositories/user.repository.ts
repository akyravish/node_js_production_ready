/**
 * REPOSITORIES FOLDER
 *
 * Purpose: Data access layer that abstracts database operations.
 * Repositories encapsulate complex queries and provide a clean interface
 * for data access using Prisma.
 *
 * Best Practices:
 * - One repository per domain entity
 * - Use Prisma for all database operations
 * - Keep queries focused and reusable
 * - Return Prisma models or transform to domain objects
 * - Handle database-specific logic here
 */

import { prisma } from '../lib';
import { DatabaseError } from '../lib/errors';
import { User } from '@prisma/client';

/**
 * Create user input data type
 */
export interface CreateUserRepositoryData {
  email?: string;
  name?: string;
  password?: string;
}

/**
 * Update user input data type
 */
export interface UpdateUserRepositoryData {
  email?: string;
  name?: string;
  password?: string;
}

/**
 * Find user by ID
 */
export async function findUserById(id: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    return user;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to find user by ID';
    throw new DatabaseError(`Database query failed: ${errorMessage}`);
  }
}

/**
 * Find user by email
 * Note: This assumes email field exists. If not, this will need to be updated
 * when the Prisma schema is updated.
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    // For now, return null since email field doesn't exist in schema
    // This is a placeholder for when the schema is updated
    // When schema is updated, uncomment:
    // return prisma.user.findUnique({ where: { email } });
    return null;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to find user by email';
    throw new DatabaseError(`Database query failed: ${errorMessage}`);
  }
}

/**
 * Create a new user
 */
export async function createUser(data: CreateUserRepositoryData): Promise<User> {
  try {
    const user = await prisma.user.create({
      data: {
        // Currently, Prisma schema only has id, createdAt, updatedAt
        // When schema is updated, uncomment and use these fields:
        // email: data.email,
        // name: data.name,
        // password: data.password,
      },
    });
    return user;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create user';

    // Handle unique constraint violations
    if (errorMessage.includes('Unique constraint') || errorMessage.includes('unique')) {
      throw new DatabaseError('User with this email already exists');
    }

    throw new DatabaseError(`Database operation failed: ${errorMessage}`);
  }
}

/**
 * Update user by ID
 */
export async function updateUser(id: string, data: UpdateUserRepositoryData): Promise<User> {
  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        // Currently, Prisma schema only has id, createdAt, updatedAt
        // When schema is updated, uncomment and use these fields:
        // email: data.email,
        // name: data.name,
        // password: data.password,
      },
    });
    return user;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update user';

    // Handle record not found
    if (
      errorMessage.includes('Record to update does not exist') ||
      errorMessage.includes('not found')
    ) {
      throw new DatabaseError('User not found');
    }

    // Handle unique constraint violations
    if (errorMessage.includes('Unique constraint') || errorMessage.includes('unique')) {
      throw new DatabaseError('User with this email already exists');
    }

    throw new DatabaseError(`Database operation failed: ${errorMessage}`);
  }
}

/**
 * Delete user by ID
 */
export async function deleteUser(id: string): Promise<User> {
  try {
    const user = await prisma.user.delete({ where: { id } });
    return user;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete user';

    // Handle record not found
    if (
      errorMessage.includes('Record to delete does not exist') ||
      errorMessage.includes('not found')
    ) {
      throw new DatabaseError('User not found');
    }

    throw new DatabaseError(`Database operation failed: ${errorMessage}`);
  }
}
