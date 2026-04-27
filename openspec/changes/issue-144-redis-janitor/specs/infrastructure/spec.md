# Delta Spec: chore-144-redis-janitor
Domain: infrastructure-ops

## Context
Redis management for LangGraph persistence.

---

## ADDED Requirements

### Requirement: Redis MaxMemory Enforcement
The backend MUST attempt to configure the connected Redis instance with a `maxmemory` limit of 256mb and a `maxmemory-policy` of `allkeys-lru` upon connection.
- If `CONFIG SET` fails (e.g. insufficient permissions), it MUST log a warning but NOT crash the process.

### Requirement: Checkpoint Janitor Job
A background job MUST run every 24 hours to clean up stale LangGraph data.
- **Scan Pattern**: `checkpoint:*` and `writes:*`.
- **Retention Period**: 7 days for `checkpoint:*`, 24 hours for `writes:*`.
- **Implementation**: BullMQ Repeatable Job.

### Requirement: Logging and Metrics
The Janitor job MUST log:
- Total keys scanned.
- Total keys deleted.
- Memory saved (estimated or recovered).

---

## MODIFIED Requirements

### Requirement: Redis Connection Startup
The `getRedisConnection()` function or the main server entry point MUST include the configuration enforcement logic.
