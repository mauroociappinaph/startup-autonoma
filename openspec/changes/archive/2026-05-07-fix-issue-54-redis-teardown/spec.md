# Specification - Redis Teardown

## Requirements
- **R1**: Every test file that uses the Redis service MUST close its connections before exiting.
- **R2**: The solution MUST be centralized to avoid manual implementation in each test file.
- **R3**: The `detectOpenHandles` flag in Jest should not report Redis handles after the fix.
- **R4**: The solution MUST NOT interfere with legitimate async operations (e.g., waiting for a write to finish before closing).

## Scenarios
### Scenario 1: Telemetry Test Completion
- **Given**: A test suite that records metrics in Redis.
- **When**: The test suite finishes.
- **Then**: All Redis connections (main and subscriber) must be closed.
- **And**: Jest should exit cleanly without hanging.

### Scenario 2: Concurrent Test Suites
- **Given**: Multiple test files running in parallel.
- **When**: All tests finish.
- **Then**: Each process must have closed its own connections.
