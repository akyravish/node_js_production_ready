import { Consumer, Kafka, Producer } from 'kafkajs';
import { config } from '../config';
import { KafkaError } from './errors';
import logger from './logger';

const kafka = new Kafka({
  clientId: 'secure-node-service',
  brokers: config.kafkaBrokers,
});

const producer: Producer = kafka.producer();
const consumer: Consumer = kafka.consumer({ groupId: 'secure-node-service-group' });

export async function initKafka(): Promise<void> {
  try {
    await producer.connect();
    await consumer.connect();
    // Example subscription - consumer handler should be registered by modules
    // consumer.subscribe({ topic: 'user.events', fromBeginning: false });
  } catch (err) {
    logger.error({ err }, 'Failed to initialize Kafka');
    throw new KafkaError('Failed to initialize Kafka connections');
  }
}

export async function disconnectKafka(): Promise<void> {
  try {
    await Promise.all([producer.disconnect(), consumer.disconnect()]);
    logger.info('Kafka connections disconnected');
  } catch (err) {
    logger.error({ err }, 'Error disconnecting Kafka');
    throw new KafkaError('Failed to disconnect Kafka connections');
  }
}

export type KafkaMessage = Record<string, unknown>;

export async function sendEvent(topic: string, message: KafkaMessage): Promise<void> {
  try {
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
  } catch (err) {
    logger.error({ err, topic }, 'Failed to send Kafka event');
    throw new KafkaError(`Failed to send event to topic: ${topic}`);
  }
}

export { consumer, kafka, producer };
