/**
 * Integration test example
 *
 * Note: These tests require running services (PostgreSQL, Redis, Kafka) or proper mocking.
 * For CI/CD, use test containers or mock these services.
 *
 * To run these tests:
 * 1. Ensure services are running, OR
 * 2. Mock the services in the test setup
 */

// Skip integration tests if services aren't available
const SKIP_INTEGRATION = process.env.SKIP_INTEGRATION_TESTS === 'true';

describe.skip('Health Check Integration', () => {
  // Skip by default - uncomment and set up services to run
  // const request = require('supertest');
  // const express = require('express');
  // const healthRoutes = require('../../src/routes/health.route');

  // let app: express.Application;

  // beforeAll(() => {
  //   app = express();
  //   app.use(express.json());
  //   app.use('/health', healthRoutes);
  // });

  // it('should return health status', async () => {
  //   const response = await request(app).get('/health');
  //   expect([200, 503]).toContain(response.status);
  //   expect(response.body).toHaveProperty('status');
  //   expect(response.body).toHaveProperty('checks');
  //   expect(response.body).toHaveProperty('timestamp');
  // });
});
