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
import {
  UserAlreadyExistsError,
  UserNotFoundError,
  DatabaseError,
  KafkaError,
} from '../lib/errors';
import * as userRepository from '../repositories/user.repository';
import { CreateUserData, UpdateUserData, UserPublic, toUserPublic } from '../types/user.types';

/**
 * Create a new user with business logic
 */
export async function createUser(data: CreateUserData): Promise<UserPublic> {
  try {
    // Business logic: check if user already exists
    if (data.email) {
      const existingUser = await userRepository.findUserByEmail(data.email);
      if (existingUser) {
        throw new UserAlreadyExistsError('User with this email already exists');
      }
    }

    // Create user through repository
    const user = await userRepository.createUser({
      email: data.email,
      name: data.name,
      password: data.password,
    });

    // Publish event for async processing
    try {
      await publishUserCreated({
        userId: user.id,
        // Add additional fields to event payload as needed
      });
    } catch (error) {
      // Log Kafka error but don't fail the user creation
      // In production, you might want to use a retry mechanism or dead letter queue
      const errorMessage = error instanceof Error ? error.message : 'Unknown Kafka error';
      throw new KafkaError(`Failed to publish user created event: ${errorMessage}`);
    }

    return toUserPublic(user);
  } catch (error) {
    // Re-throw domain-specific errors as-is
    if (
      error instanceof UserAlreadyExistsError ||
      error instanceof DatabaseError ||
      error instanceof KafkaError
    ) {
      throw error;
    }

    // Wrap unexpected errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new DatabaseError(`Failed to create user: ${errorMessage}`);
  }
}

/**
 * Get user by ID
 */
export async function getUserById(id: string): Promise<UserPublic> {
  try {
    const user = await userRepository.findUserById(id);

    if (!user) {
      throw new UserNotFoundError('User not found');
    }

    return toUserPublic(user);
  } catch (error) {
    // Re-throw domain-specific errors as-is
    if (error instanceof UserNotFoundError || error instanceof DatabaseError) {
      throw error;
    }

    // Wrap unexpected errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new DatabaseError(`Failed to get user: ${errorMessage}`);
  }
}

/**
 * Update user
 */
export async function updateUser(id: string, data: UpdateUserData): Promise<UserPublic> {
  try {
    // Check if user exists
    const existingUser = await userRepository.findUserById(id);
    if (!existingUser) {
      throw new UserNotFoundError('User not found');
    }

    // Check if email is being updated and if it's already taken
    // Note: This assumes email field exists in the User model
    // When schema is updated, uncomment:
    // if (data.email && data.email !== (existingUser as { email?: string }).email) {
    //   const userWithEmail = await userRepository.findUserByEmail(data.email);
    //   if (userWithEmail && userWithEmail.id !== id) {
    //     throw new UserAlreadyExistsError('User with this email already exists');
    //   }
    // }

    // Update user through repository
    // Note: Prisma automatically updates updatedAt field
    const updatedUser = await userRepository.updateUser(id, {
      email: data.email,
      name: data.name,
      password: data.password,
    });

    return toUserPublic(updatedUser);
  } catch (error) {
    // Re-throw domain-specific errors as-is
    if (
      error instanceof UserNotFoundError ||
      error instanceof UserAlreadyExistsError ||
      error instanceof DatabaseError
    ) {
      throw error;
    }

    // Wrap unexpected errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new DatabaseError(`Failed to update user: ${errorMessage}`);
  }
}

/**
 * Delete user by ID
 */
export async function deleteUser(id: string): Promise<void> {
  try {
    // Check if user exists
    const existingUser = await userRepository.findUserById(id);
    if (!existingUser) {
      throw new UserNotFoundError('User not found');
    }

    // Delete user through repository
    await userRepository.deleteUser(id);
  } catch (error) {
    // Re-throw domain-specific errors as-is
    if (error instanceof UserNotFoundError || error instanceof DatabaseError) {
      throw error;
    }

    // Wrap unexpected errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new DatabaseError(`Failed to delete user: ${errorMessage}`);
  }
}
