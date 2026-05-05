# Change Proposal: Process Resilience (Issue #218)

## Intent
Asegurar que el sistema sea resiliente a fugas de conexiones y cierres abruptos. Actualmente, el cliente de Prisma podría instanciarse múltiples veces en entornos de desarrollo/test, y el motor de IA en Python no maneja señales de terminación, lo que puede dejar sockets gRPC colgados.

## Scope
- **Backend**: Refactorización del cliente de Prisma en `packages/db`.
- **AI Engine**: Implementación de handlers de señales (SIGTERM/SIGINT) en el servidor gRPC.

## Proposed Approach
1.  **Prisma Singleton**: Refinar el `packages/db/src/index.ts` para asegurar que el objeto `prisma` sea verdaderamente único en el espacio de nombres global de Node.js.
2.  **Graceful Shutdown**: Modificar el punto de entrada del `ai-engine` para interceptar señales del OS y cerrar el servidor gRPC de forma ordenada, esperando a que las tareas en curso terminen o se cancelen limpiamente.

## Risks
- Interrupción de tareas de IA largas si el timeout de shutdown es muy corto.
- Incompatibilidades de tipos en el Singleton de Prisma si se usan múltiples versiones del cliente (poco probable en este monorepo).
