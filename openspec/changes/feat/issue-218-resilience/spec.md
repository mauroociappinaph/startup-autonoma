# Specification: Process Resilience (Issue #218)

## Requirements
- **R1: Prisma Singleton**: Only one instance of `PrismaClient` must exist in memory at any time during development.
- **R2: Type Safety**: The global Prisma instance must be strictly typed (No `any`).
- **R3: Graceful Shutdown**: The AI Engine must catch `SIGTERM` and `SIGINT` signals.
- **R4: Connection Draining**: The gRPC server must wait for active calls to complete or timeout (10s) before exiting.

## Scenarios

### Scenario 1: Hot Reload Stability
- **Given**: The backend is running with `tsx watch`.
- **When**: A file is modified and the process restarts partially.
- **Then**: The existing `PrismaClient` from the global namespace is reused.
- **And**: Connection pool usage remains constant.

### Scenario 2: Clean Shutdown of AI Engine
- **Given**: The AI Engine is running.
- **When**: A `SIGTERM` is sent to the process.
- **Then**: The `lifespan` handler is triggered.
- **And**: The log shows "📢 Iniciando shutdown del AI Engine...".
- **And**: The process exits with Code 0 after closing the gRPC server.
