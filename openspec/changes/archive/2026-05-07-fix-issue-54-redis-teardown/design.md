# Technical Design - Redis Teardown

## Architecture Changes
We will utilize Jest's global setup/teardown capabilities or the `setupFilesAfterEnv` hook to ensure a clean state.

### 1. Global afterAll Hook
Modify `backend/src/tests/jest.setup.ts` to include:
```typescript
import { closeRedisConnections } from '../db/redis.js';

afterAll(async () => {
  await closeRedisConnections();
});
```

### 2. Service Singleton Validation
Verify that `getRedisConnection` in `backend/src/db/redis.ts` is indeed returning the same instance across all services in a single process.

### 3. BullMQ Connection Handling
BullMQ workers and queues might create their own internal timers or connections if not handled carefully. We will ensure they use the `connection` option from `getRedisConnection()`.

## Verification Plan
1. Run `PATH=$PATH:/usr/local/bin npm test src/tests/telemetry.test.ts --detectOpenHandles`.
2. Verify that the "Redis: conexiones cerradas" log appears.
3. Verify that Jest exits without the "open handles" warning.
