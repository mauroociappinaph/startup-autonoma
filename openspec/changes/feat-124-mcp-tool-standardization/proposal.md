# Propuesta: Estandarización de Herramientas via MCP (#124)

## Contexto y Problema

La Startup Autónoma tiene hoy **13 workers** que ejecutan tareas atómicas. Cada
worker importa sus herramientas directamente via imports de TypeScript:

```ts
// code_writer_node.ts — hardcoded, acoplado
import { write_file, patch_file } from "@/tools/fs.js";

// test_runner_node.ts — hardcoded, acoplado
import { test_runner } from "@/tools/domain/software/testRunner.js";
```

El registro central de herramientas existe (`src/tools/index.ts`) pero no está
siendo usado por los workers: cada uno importa lo que necesita en forma directa.

**Esto genera tres problemas concretos:**

### Problema 1: Acoplamiento fuerte
Si el nombre de un tool cambia, hay que rastrear TODOS los workers que lo usan.
No hay un contrato único.

### Problema 2: No hay Discovery
Un agente no puede saber "qué herramientas tengo disponibles para esta tarea" sin
leer el código. Los Chiefs hardcodean qué worker mandar y qué tools asumen.

### Problema 3: `save_to_engram` es un stub
La herramienta de Engram (línea 14 del archivo) tiene un `console.log` y devuelve
un ID falso. Nunca llama al MCP real de Engram. La memoria organizacional del sistema
está rota a nivel de tool.

## Solución Propuesta

Implementar una **capa MCP (Model Context Protocol)** que:

1. **Centralice el registro** de herramientas en un `ToolRegistry` con capacidad
   de Discovery (listado dinámico de capacidades disponibles).
2. **Conecte la herramienta `save_to_engram`** al cliente MCP real de Engram
   en lugar del stub actual.
3. **Defina un protocolo de comunicación** estándar para que los workers pidan
   herramientas al registro en vez de importarlas directamente (sin romper la
   arquitectura actual — evolución gradual, no big bang).

## Alcance (Scope)

**IN:** 
- Crear `src/mcp_ports/toolRegistry.ts` — ToolRegistry con Discovery.
- Implementar `src/mcp_ports/engramPort.ts` — Conexión real al MCP de Engram.
- Actualizar `save_to_engram` para usar el Port en lugar del stub.
- Agregar método `getToolsByCategory()` al registry para futuro Discovery.
- Tests unitarios del registry y del port de Engram.

**OUT (fuera de scope ahora):**
- Refactorizar todos los workers para que consuman herramientas via registry
  (eso es la issue #141 — Idempotencia, que depende de ésta).
- Implementar un servidor MCP completo con HTTP/SSE (eso requiere infra separada).
- Cambiar la arquitectura del grafo.

## Definición de "Listo"

- El `ToolRegistry` puede devolver herramientas por nombre y por categoría.
- La herramienta `save_to_engram` invoca el MCP real de Engram (no stub).
- Los tests del registry y el port pasan en verde en la suite completa.
- TypeScript sin errores (`npm run check`).
