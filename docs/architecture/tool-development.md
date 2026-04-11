# Tool Development Lifecycle: Extending Agent Capabilities

Las herramientas (Tools) son los mecanismos mediante los cuales los agentes interactúan con el sistema de archivos, APIs externas y otros servicios.

## Ubicación y Estructura

Las herramientas deben seguir una estructura estricta según su tipo:

### 1. Domain Tools (Business / Software)
Residen en: `/backend/src/tools/domain/`
- Ejemplos: `market_analyzer`, `lead_validator`, `code_analyzer`.

### 2. Platform Tools (Core)
Residen en: `/backend/src/tools/platform/`
- Ejemplos: `engram_memory`, `git_cli`, `file_system`.

---

## Proceso de Creación (Ciclo de Vida)

1.  **Definir el Contrato (Zod):** Antes de programar, definimos el schema de entrada y salida con Zod. Sin validación estricta, no hay herramienta.
2.  **Implementación Funcional:** Desarrollamos la lógica (TypeScript para Node.js, Python para IA pesada), manteniendo el principio **SRP**.
3.  **Registro (MCP Server):** La herramienta se declara en el servidor MCP para que los agentes la descubran.
4.  **Inyección de Observabilidad:** Cada ejecución debe estar vinculada al `trace_id` del flujo.

---

## Ejemplo de Contrato (Backend - TS)

```typescript
import { z } from 'zod';

export const HerramientaGitCommitSchema = z.object({
  mensaje: z.string().min(10).max(100),
  archivos: z.array(z.string()),
  forzar: z.boolean().default(false)
});

export type GitCommitInput = z.infer<typeof HerramientaGitCommitSchema>;

export const ToolResponseSchema = z.object({
  success: z.boolean(),
  errorMessage: z.string().optional(),
  accion_requerida: z.string().optional(),
  stdout: z.string().optional()
});

## Reglas de Oro

- **Idempotencia:** Ejecutar la misma herramienta con los mismos parámetros no debe causar estados inesperados.
- **Trazabilidad:** Cada llamada genera un registro en el `trace_id` activo.
- **Protocolo de Tool Safe Catch:** Las herramientas NUNCA arrojan un throw que mate el hilo. Siempre deben encasillar su salida en el `ToolResponseSchema`, indicando `success: false` con un `errorMessage` claro para que LangGraph lo capture e intente auto-corrección sin abortar.
- **DRY:** Lógica reutilizable va a `/backend/src/helpers/`.
