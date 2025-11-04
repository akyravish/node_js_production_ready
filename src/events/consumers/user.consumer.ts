/**
 * EVENTS/CONSUMERS FOLDER
 *
 * Purpose: Kafka event consumers that subscribe to topics and process incoming events.
 * These handle asynchronous event processing from other services or internal events.
 *
 * Best Practices:
 * - One consumer per topic/event type
 * - Implement idempotent handlers
 * - Handle errors and retries
 * - Log processing for debugging
 * - Consider event ordering requirements
 * - Use consumer groups for scaling
 */

import { consumer } from '../../lib/kafka';
import logger from '../../lib/logger';

export type UserCreatedEvent = {
  userId: string;
  timestamp: string;
  source: string;
  // Add additional fields as needed (e.g., email, name, etc.)
};

/**
 * Handle user created event from another service
 */
export async function handleUserCreated(message: UserCreatedEvent): Promise<void> {
  try {
    logger.info({ userId: message.userId }, 'Processing user created event');

    // Example: Send welcome email, update analytics, etc.
    // This is where you implement your business logic for handling the event

    logger.info({ userId: message.userId }, 'User created event processed successfully');
  } catch (err) {
    logger.error({ err, userId: message.userId }, 'Failed to process user created event');
    throw err; // Re-throw to trigger retry mechanism
  }
}

/**
 * Subscribe to user events
 * Call this during application startup (e.g., in server.ts)
 */
export async function subscribeToUserEvents(): Promise<void> {
  await consumer.subscribe({ topic: 'user.created', fromBeginning: false });
  await consumer.subscribe({ topic: 'user.updated', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      if (!message.value) return;

      try {
        const event = JSON.parse(message.value.toString()) as UserCreatedEvent;

        switch (topic) {
          case 'user.created':
            await handleUserCreated(event);
            break;
          case 'user.updated':
            // Handle user updated event
            logger.info({ event }, 'User updated event received');
            break;
          default:
            logger.warn({ topic }, 'Unknown topic received');
        }
      } catch (err) {
        logger.error({ err, topic, partition }, 'Error processing message');
      }
    },
  });
}
