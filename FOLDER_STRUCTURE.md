# Folder Structure Documentation

This document explains the purpose and usage of each folder in the `src/` directory.

## 📁 Folder Purposes

### `config.ts`

**Purpose**: Application configuration and environment variable management.

- Loads and validates environment variables
- Exports a typed config object
- Handles defaults for optional settings

### `server.ts`

**Purpose**: Main application entry point and Express server setup.

- Initializes Express app
- Configures middleware
- Sets up routes
- Handles graceful shutdown

---

## 📂 `controllers/`

**Purpose**: HTTP request handlers that process incoming requests and return responses.

**Responsibilities**:

- Receive HTTP requests
- Validate input using schemas
- Call service layer for business logic
- Return HTTP responses with appropriate status codes

**Example**: `user.controller.ts` - Handles user-related HTTP endpoints

**Best Practices**:

- Keep controllers thin (delegate to services)
- Use `AuthedRequest` for authenticated routes
- Validate input with Zod schemas
- Return appropriate HTTP status codes

---

## 📂 `services/`

**Purpose**: Business logic layer that contains core application logic.

**Responsibilities**:

- Implement business rules and logic
- Orchestrate data access through repositories
- Handle business validation
- Coordinate between multiple repositories/services
- Can publish events for async processing

**Example**: `user.service.ts` - Contains user creation, update, and retrieval logic

**Best Practices**:

- No HTTP concerns (no Express types)
- Use repositories for data access
- Throw domain-specific errors
- Can call other services
- Return domain objects, not database models

---

## 📂 `repositories/`

**Purpose**: Data access layer that abstracts database operations.

**Responsibilities**:

- Direct database queries using Prisma
- Encapsulate complex queries
- Provide a clean interface for data access
- Handle database-specific logic

**Example**: `user.repository.ts` - Contains user database queries

**Best Practices**:

- One repository per domain entity
- Use Prisma for all database operations
- Keep queries focused and reusable
- Return Prisma models or transform to domain objects

---

## 📂 `routes/`

**Purpose**: Express route definitions that map HTTP endpoints to controllers.

**Responsibilities**:

- Define API routes and HTTP methods
- Apply middleware (auth, rate limiting, etc.)
- Connect routes to controller functions
- Organize routes by resource/domain

**Example**: `health.route.ts`, `index.ts` - Route definitions

**Best Practices**:

- Group related routes together
- Use middleware for authentication, validation, rate limiting
- Export route modules for use in main router

---

## 📂 `middleware/`

**Purpose**: Express middleware functions that process requests/responses.

**Responsibilities**:

- Authentication/authorization
- Request validation
- Error handling
- Rate limiting
- Request logging
- Security headers

**Examples**:

- `auth.ts` - JWT authentication
- `errorHandler.ts` - Global error handling
- `ratelimiter.ts` - Rate limiting
- `sanitize.ts` - Input sanitization
- `requestId.ts` - Request correlation IDs
- `timeout.ts` - Request timeouts

---

## 📂 `schemas/`

**Purpose**: Zod validation schemas for request/response validation.

**Responsibilities**:

- Define input validation schemas
- Type inference from schemas
- Request/response validation
- Query parameter validation

**Example**: `user.schema.ts` - User creation/update validation schemas

**Best Practices**:

- One schema file per resource
- Use Zod for runtime validation
- Export TypeScript types from schemas
- Validate at controller level

---

## 📂 `lib/`

**Purpose**: Core library integrations and shared utilities.

**Responsibilities**:

- Database client (Prisma)
- Redis client
- Kafka client
- JWT utilities
- Logger configuration

**Files**:

- `prisma.ts` - Prisma client
- `redis.ts` - Redis client
- `kafka.ts` - Kafka producer/consumer
- `jwt.ts` - JWT token functions
- `logger.ts` - Logger configuration
- `index.ts` - Barrel export

---

## 📂 `events/producers/`

**Purpose**: Kafka event producers that publish events to topics.

**Responsibilities**:

- Publish events to Kafka topics
- Define event schemas/types
- Format events with metadata
- Handle producer errors

**Example**: `user.producer.ts` - Publishes user.created, user.updated events

**Best Practices**:

- One producer per domain
- Use consistent event naming
- Include metadata (timestamp, source)
- Handle errors gracefully

---

## 📂 `events/consumers/`

**Purpose**: Kafka event consumers that process incoming events.

**Responsibilities**:

- Subscribe to Kafka topics
- Process incoming events
- Implement idempotent handlers
- Handle errors and retries

**Example**: `user.consumer.ts` - Handles user events from other services

**Best Practices**:

- One consumer per topic/event type
- Implement idempotency
- Log processing for debugging
- Handle errors with retries

---

## 📂 `types/`

**Purpose**: TypeScript type definitions and shared interfaces.

**Responsibilities**:

- Define domain entity types
- API request/response types
- Shared type utilities
- DTO (Data Transfer Object) types

**Example**: `user.types.ts` - User-related type definitions

**Best Practices**:

- One file per domain
- Use for type safety across layers
- Avoid duplicating Prisma types
- Export reusable utilities

---

## 📂 `utils/`

**Purpose**: Reusable utility functions and helpers.

**Responsibilities**:

- Pure utility functions
- String manipulation
- Date formatting
- Validation helpers
- Common algorithms

**Example**: `validation.ts` - Email validation, string sanitization

**Best Practices**:

- Keep functions pure when possible
- Make functions generic and reusable
- Document function behavior
- Test thoroughly

---

## 🏗️ Architecture Flow

```
HTTP Request
    ↓
Routes (routes/)
    ↓
Middleware (middleware/) - Auth, validation, rate limiting
    ↓
Controllers (controllers/) - Request handling
    ↓
Schemas (schemas/) - Input validation
    ↓
Services (services/) - Business logic
    ↓
Repositories (repositories/) - Data access
    ↓
Database (via Prisma)
```

**Event-Driven Flow**:

```
Service → Producer (events/producers/) → Kafka → Consumer (events/consumers/) → Service
```

---

## 📝 Notes

- **Separation of Concerns**: Each layer has a specific responsibility
- **Dependency Direction**: Controllers → Services → Repositories → Database
- **Type Safety**: Use TypeScript types and Zod schemas throughout
- **Error Handling**: Errors bubble up to middleware error handler
- **Testing**: Each layer can be tested independently
