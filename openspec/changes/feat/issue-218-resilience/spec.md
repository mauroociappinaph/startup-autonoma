# Specification: Process Resilience (Issue #218)

## Requirements
### R1: Prisma Singleton
- El cliente de Prisma DEBE ser instanciado una sola vez por proceso.
- En entornos de no-producción, se DEBE persistir la instancia en el objeto `global` para sobrevivir a los hot-reloads de Next.js/tsx.

### R2: Graceful Shutdown (AI Engine)
- El servidor gRPC de Python DEBE interceptar `SIGINT` (Ctrl+C) y `SIGTERM` (Docker stop).
- Al recibir una señal, el servidor DEBE dejar de aceptar nuevas peticiones.
- El servidor DEBE esperar un máximo de 10 segundos para que las peticiones en curso terminen antes de forzar el cierre.

## Scenarios
### Scenario 1: Prisma Connection Pool Stability
- **Given**: Un entorno de desarrollo con hot-reload activo.
- **When**: Se realizan múltiples cambios en el código que disparan reinicios del servidor.
- **Then**: El número de conexiones activas en PostgreSQL no debe aumentar indefinidamente.

### Scenario 2: AI Engine Shutdown ordered
- **Given**: El motor de IA está procesando una tarea de Lead Generation.
- **When**: Se recibe una señal `SIGTERM`.
- **Then**: El proceso debe registrar un log de "Graceful shutdown initiated" y esperar a que la tarea termine (o el timeout expire) antes de salir con código 0.
