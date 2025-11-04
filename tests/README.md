# Test Suite

This directory contains the test suite for the copy-service application.

## Structure

```
tests/
├── setup.ts              # Jest configuration and test environment setup
├── unit/                 # Unit tests (isolated function/class tests)
│   ├── lib/             # Library utility tests
│   ├── middleware/      # Middleware tests
│   ├── services/        # Service layer tests
│   └── utils/           # Utility function tests
└── integration/         # Integration tests (multiple components together)
    └── health.test.ts   # Health check endpoint test
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

## Test Examples

### Unit Tests
- **JWT utilities** (`tests/unit/lib/jwt.test.ts`): Tests for JWT signing, verification, and token extraction
- **Validation utilities** (`tests/unit/utils/validation.test.ts`): Tests for email validation, string sanitization, date formatting
- **User service** (`tests/unit/services/user.service.test.ts`): Tests for user business logic with mocked dependencies
- **Sanitize middleware** (`tests/unit/middleware/sanitize.test.ts`): Tests for input sanitization middleware

### Integration Tests
- **Health check** (`tests/integration/health.test.ts`): Tests for health endpoint (requires running services or mocks)

## Writing New Tests

### Unit Test Example

```typescript
import { functionToTest } from '../../src/path/to/module';

describe('Function Name', () => {
  it('should do something specific', () => {
    const result = functionToTest(input);
    expect(result).toBe(expectedOutput);
  });

  it('should handle edge cases', () => {
    expect(() => functionToTest(invalidInput)).toThrow();
  });
});
```

### Service Test with Mocking Example

```typescript
import { prisma } from '../../../src/lib';

jest.mock('../../../src/lib', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

describe('Service Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should test service logic', async () => {
    const mockPrisma = prisma as jest.Mocked<PrismaClient>;
    mockPrisma.user.findUnique.mockResolvedValue(mockData);

    // Test your service
  });
});
```

## Test Environment

The test environment is configured in `tests/setup.ts`:
- Sets `NODE_ENV=test`
- Provides test environment variables
- Configures test-specific settings

## Coverage

Coverage reports are generated in the `coverage/` directory when running `npm run test:coverage`.

Target coverage areas:
- Utility functions: 100%
- Services: >80%
- Middleware: >80%
- Controllers: >70%

## Notes

- Integration tests may require running services (PostgreSQL, Redis, Kafka) or proper mocking
- Use test containers (Docker) for integration tests in CI/CD
- Mock external dependencies in unit tests
- Keep tests fast and isolated
