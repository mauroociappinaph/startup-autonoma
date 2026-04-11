# Tool Development Lifecycle: Extending Agent Capabilities

Las herramientas (Tools) son los mecanismos mediante los cuales los agentes interactúan con el sistema de archivos, APIs externas y otros servicios.

## Ubicación y Estructura

Las herramientas deben seguir una estructura estricta según su tipo:

### 1. Herramientas de Dominio (Business / Software)
Residen en: `/backend/src/herramientas/dominio/`
- Ejemplos: `analizador_de_mercado`, `validador_de_leads`, `analizador_de_codigo`.

### 2. Herramientas de Plataforma (Core)
Residen en: `/backend/src/herramientas/plataforma/`
- Ejemplos: `memoria_engram`, `git_cli`, `sistema_de_archivos`.

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
```

## Reglas de Oro

- **Idempotencia:** Ejecutar la misma herramienta con los mismos parámetros no debe causar estados inesperados.
- **Trazabilidad:** Cada llamada genera un registro en el `trace_id` activo.
- **Manejo de Errores:** Las herramientas NUNCA deben fallar silenciosamente; devuelven un objeto de error estructurado.
- **DRY:** Lógica reutilizable va a `/backend/src/helpers/`.
