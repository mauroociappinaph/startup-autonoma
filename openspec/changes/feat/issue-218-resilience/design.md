# Technical Design: Process Resilience (Issue #218)

## Architecture

### 1. Prisma Singleton (Backend)
- **Location**: `packages/db/src/index.ts`.
- **Logic**:
  ```typescript
  import { PrismaClient } from "@prisma/client";
  const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
  };
  export const prisma = globalForPrisma.prisma ?? new PrismaClient();
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
  ```
- **Benefit**: Strictly typed via the exported `PrismaClient` type.

### 2. AI Engine Graceful Shutdown (Python)
- **Location**: `ai-engine/app/main.py` and `ai-engine/app/core/grpc_server.py`.
- **Logic**:
  - `main.py`: Uses FastAPI `lifespan` to manage the event loop lifecycle.
  - `grpc_server.py`: The `serve()` function must be awaitable and handle cancellation.
- **Signal Handling**: Uvicorn automatically handles signals and triggers the FastAPI `lifespan` shutdown.

## Verification Plan
- **Scripted Check**: `backend/src/test-db.ts` to ensure Prisma is working.
- **Manual Check**: Send `kill -TERM` to the AI Engine process and verify logs.
