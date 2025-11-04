/**
 * SERVICES FOLDER
 *
 * Purpose: Business logic layer. Services contain the core application logic,
 * orchestrate data access through repositories, and handle business rules.
 * Services should be independent of HTTP concerns (no Express types).
 *
 * Best Practices:
 * - One service per domain/resource
 * - Use repositories for data access
 * - Handle business logic and validation
 * - Can call other services
 * - Throw domain-specific errors
 * - Return domain objects (not database models)
 */

import { publishUserCreated } from '../events/producers/user.producer';
import { prisma } from '../lib';
import { CreateUserData, UpdateUserData } from '../types/user.types';

/**
 * Create a new user with business logic
 */
export async function createUser(data: CreateUserData) {
  // Business logic: check if user already exists (if you add unique email field)
  // const existingUser = await prisma.user.findUnique({
  //   where: { email: data.email },
  // });
  // if (existingUser) {
  //   throw new Error('User already exists');
  // }

  // Create user (Prisma will generate ID automatically)
  const user = await prisma.user.create({
    data: {
      // Add fields as they're added to your Prisma schema
      // Example: email, name, etc.
    },
  });

  // Publish event for async processing
  await publishUserCreated({
    userId: user.id,
    // Add additional fields to event payload as needed
  });

  return {
    id: user.id,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * Get user by ID
 */
export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return {
    id: user.id,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * Update user
 */
export async function updateUser(id: string, data: UpdateUserData) {
  // Note: Prisma automatically updates updatedAt field
  const user = await prisma.user.update({
    where: { id },
    data: {
      // Add updatable fields as they're added to your Prisma schema
      // Example: name, email, etc.
    },
  });

  return {
    id: user.id,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
