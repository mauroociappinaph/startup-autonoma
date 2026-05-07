# Proposal - Fix Redis Teardown in Tests

## Goal
Resolve the issue where Redis connections remain open after test execution, causing Jest to hang and requiring `--forceExit`.

## Problem
The backend uses a Singleton pattern for Redis connections (`ioredis`). While a `closeRedisConnections` function exists, it is not consistently called in the test suites, leading to "open handles".

## Proposed Solution
1. **Global Teardown**: Implement a global `afterAll` hook in `jest.setup.ts` to ensure `closeRedisConnections()` is called after every test file.
2. **Connection Management**: Ensure all services (Budget, Telemetry, EventBus) use the shared connection and don't instantiate private ones.
3. **Queue Cleanup**: Identify tests using BullMQ and ensure queues/workers are properly closed.

## Alternatives Considered
- **Manual Teardown in each test**: Too error-prone and repetitive.
- **Using `jest.useFakeTimers()`**: Doesn't solve the connection handle issue.

## Risks
- If `closeRedisConnections` is called before an async operation finishes, it might cause "Connection closed" errors. We need to ensure it's the very last thing that happens.
