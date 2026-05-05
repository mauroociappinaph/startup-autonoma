# Technical Design: Process Resilience (Issue #218)

## Architecture Decisions

### D1: Pattern Singleton en TypeScript
Usaremos la técnica estándar de Next.js/Prisma para el singleton global:
```typescript
const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

### D2: Async Shutdown en Python
Utilizaremos el método `server.stop(grace)` de `grpc.aio` (o el servidor síncrono si aplica) para manejar el cierre.
Implementaremos un handler genérico:
```python
def handle_exit(sig, frame):
    print(f"Received signal {sig}, shutting down...")
    server.stop(10).wait()
```

## Component Breakdown
### backend/packages/db
- Actualizar `src/index.ts` para asegurar el Singleton y manejar los tipos de `global`.

### ai-engine/app
- Modificar `main.py` o `grpc_server.py` para registrar los handlers de `signal`.

## Verification Plan
### Automated Tests
- Scripts de stress test para validar conexiones de Prisma.
- Mock de señales en Python para verificar el flujo de shutdown.

### Manual Verification
- Levantar Docker y correr `docker stop ai-engine`, verificando los logs de salida.
