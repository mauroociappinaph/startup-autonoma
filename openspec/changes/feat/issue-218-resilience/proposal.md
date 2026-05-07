# Change Proposal: Process Resilience & Singleton Enforcement (Issue #218)

## Problem
1. **Prisma Connection Leak**: In development with hot-reloading (tsx watch), multiple `PrismaClient` instances can be created, exhausting the database connection pool.
2. **AI Engine Hanging Sockets**: The Python gRPC server (ai-engine) does not always release sockets cleanly when the container restarts or the process is killed, leading to `EADDRINUSE` errors.
3. **Implicit Type Risks**: Current Singleton implementation in `packages/db` uses `any`, violating the "No Any" Sacred Law.

## Goals
- Enforce a strict Singleton pattern for Prisma with proper TypeScript typing.
- Implement a robust Graceful Shutdown for the AI Engine (Python/gRPC).
- Verify resilience through automated scripts that simulate process termination.

## Proposed Approach
- **Backend (Prisma)**:
  - Define a global type for the Prisma singleton to eliminate `any`.
  - Use `globalThis` for cross-module persistence in development.
- **AI Engine (Python)**:
  - Refine the `lifespan` handler in `app/main.py`.
  - Ensure the gRPC `serve()` function catches `asyncio.CancelledError` and closes the server with a grace period.

## Risks
- **Testing Interference**: Global singletons can sometimes share state between parallel tests if not handled carefully (though Prisma is stateless regarding the client object).

## User Review Required
> [!NOTE]
> We are using `globalThis` (via `global` casting) to maintain the Prisma instance across hot-reloads. This is a standard pattern for Prisma in Next.js/Node environments.
