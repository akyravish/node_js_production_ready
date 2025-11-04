/**
 * EVENTS/PRODUCERS FOLDER
 *
 * Purpose: Kafka event producers that publish events to topics. Use this for
 * asynchronous event-driven communication between services.
 *
 * Best Practices:
 * - One producer per domain/event type
 * - Define event schemas/types
 * - Use consistent event naming (e.g., user.created, user.updated)
 * - Include metadata (timestamp, source, version)
 * - Handle producer errors gracefully
 */

import { sendEvent } from '../../lib/kafka';

export type UserCreatedEvent = {
  userId: string;
  timestamp: string;
  source: string;
  // Add additional fields as needed (e.g., email, name, etc.)
};

/**
 * Publish user created event
 */
export async function publishUserCreated(
  payload: Omit<UserCreatedEvent, 'timestamp' | 'source'>,
): Promise<void> {
  const event: UserCreatedEvent = {
    ...payload,
    timestamp: new Date().toISOString(),
    source: 'copy-service',
  };

  await sendEvent('user.created', event);
}

/**
 * Publish user updated event
 */
export async function publishUserUpdated(payload: {
  userId: string;
  changes: Record<string, any>;
}): Promise<void> {
  const event = {
    ...payload,
    timestamp: new Date().toISOString(),
    source: 'copy-service',
  };

  await sendEvent('user.updated', event);
}
