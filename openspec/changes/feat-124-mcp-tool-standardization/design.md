# Diseño Técnico: Estandarización de Herramientas via MCP (#124)

## Análisis del Estado Actual

### Mapa de acoplamiento actual:

```
code_writer_node.ts  ──imports──> @/tools/fs.js          (write_file, patch_file)
test_runner_node.ts  ──imports──> @/tools/domain/software/testRunner.js
git_worker_node.ts   ──imports──> ./gitWorker.js          (acoplamiento local)
operations_worker_node.ts ──────> child_process directo   (sin tool wrapper)
save_to_engram (platform) ──────> STUB (console.log)      (no llama a nada real)
```

El `src/tools/index.ts` registra las tools en `systemTools[]` pero ese array
NUNCA se usa en ningún worker. Existe solo como documentación muerta.

---

## Arquitectura Propuesta

### Patrón: Port & Adapter (Hexagonal) aplicado a herramientas

```
┌─────────────────────────────────────────────────────┐
│                    DOMAIN (Workers)                  │
│  code_writer  git_worker  test_runner  ops_worker   │
└──────────────────────┬──────────────────────────────┘
                       │ (futuro — phase 2)
                       ▼
┌─────────────────────────────────────────────────────┐
│              APPLICATION (ToolRegistry)              │
│  - getTool(name): StructuredTool                    │
│  - getToolsByCategory(cat): StructuredTool[]        │
│  - listTools(): ToolDescriptor[]                    │
└──────────────────────┬──────────────────────────────┘
                       │ delegates to
                       ▼
┌─────────────────────────────────────────────────────┐
│           INFRASTRUCTURE (MCP Ports)                 │
│  EngramPort ──────> MCP Server (Engram)             │
│  (futuros: GitPort, FileSystemPort)                 │
└─────────────────────────────────────────────────────┘
```

---

## Decisiones de Diseño

### D1: ToolRegistry como clase con método de factory estático

**Opción A:** Singleton global exportado.
**Opción B:** Clase con método `create()` + inyección de dependencia.
**Decisión: B (Opción B)**

**Razón:** El Singleton global es difícil de testear (estado compartido entre tests).
Con `ToolRegistry.create()` podemos inyectar diferentes sets de herramientas en tests
sin contaminar el estado global.

```ts
// Interfaz pública del ToolRegistry
interface ToolDescriptor {
  name: string;
  description: string;
  category: "filesystem" | "git" | "testing" | "platform" | "ai-engine";
}

class ToolRegistry {
  static create(tools: RegisteredTool[]): ToolRegistry
  getTool(name: string): StructuredTool
  getToolsByCategory(category: ToolDescriptor["category"]): StructuredTool[]
  listTools(): ToolDescriptor[]
}
```

### D2: EngramPort — cliente MCP via `@modelcontextprotocol/sdk`

**¿Por qué MCP SDK y no HTTP directo?**
El protocolo MCP usa un handshake específico (initialize → call tool). Si usamos
fetch HTTP directo, nos saltamos el protocolo y puede romperse con futuras versiones
del servidor Engram. El SDK garantiza compatibilidad.

```ts
// Flujo del EngramPort
1. new Client({ name, version })
2. client.connect(new StreamableHTTPClientTransport(url))
3. client.callTool({ name: "mem_save", arguments: { ... } })
4. client.close()
```

**Manejo de errores:** Si el servidor MCP no responde en 5 segundos (timeout),
el port devuelve un resultado de fallo estructurado y loguea via SacredLogger.warn.
No rompe el grafo.

### D3: Categorías de herramientas

```
"filesystem"  → list_dir, read_file, write_file, patch_file
"testing"     → test_runner
"platform"    → save_to_engram
"git"         → (future) git_tool cuando se encapsule gitWorker.ts
"ai-engine"   → (future) para herramientas del AI Engine Python
```

### D4: Variable de entorno para el MCP URL

`ENGRAM_MCP_URL` en `.env` → default `http://localhost:3001`
Documentar en `.env.example`.

---

## Archivos a Crear

### [NEW] `backend/src/mcp_ports/toolRegistry.ts`
Implementación del `ToolRegistry` con las interfaces `ToolDescriptor` y
`RegisteredTool`.

### [NEW] `backend/src/mcp_ports/engramPort.ts`
Implementación del `EngramPort` usando el MCP SDK de Anthropic.

### [MODIFY] `backend/src/mcp_ports/index.ts`
Actualizar el barrel file para exportar `ToolRegistry` y `EngramPort`.

### [MODIFY] `backend/src/tools/platform/engram_tool.ts`
Reemplazar el stub con una llamada real al `EngramPort`.

### [NEW] `backend/src/tests/toolRegistry.test.ts`
Tests unitarios del ToolRegistry cubriendo RF-1.1, RF-1.2, RF-1.3, RF-1.4.

### [NEW] `backend/src/tests/engramPort.test.ts`
Tests del EngramPort cubriendo RF-2.1 (mock del cliente MCP), RF-2.2 y RF-2.3.

---

## Dependencia de paquete

```bash
npm install @modelcontextprotocol/sdk --workspace=backend
```

El SDK de MCP es el estándar oficial de Anthropic para cliente/servidor MCP.
Versión mínima: `^1.0.0` (verificar compatibilidad con Node 20+).

---

## Diagrama de Flujo del EngramPort

```
agente invoca save_to_engram(args)
  │
  ▼
EngramPort.save(args)
  │
  ├─[OK]──> client.connect(ENGRAM_MCP_URL)
  │           │
  │           ├─[OK]──> client.callTool("mem_save", args)
  │           │           │
  │           │           └──> { success: true, id: "..." }
  │           │
  │           └─[TIMEOUT]──> SacredLogger.warn + { success: false, error: "MCP_UNAVAILABLE" }
  │
  └─[CONNECT_FAIL]──> SacredLogger.warn + { success: false, error: "MCP_UNAVAILABLE" }
```

---

## Riesgo Identificado

**R1: El servidor MCP de Engram (localhost:3001) no existe en desarrollo local.**
La Startup usa Engram via MCP de Cursor/IDE, no como servidor HTTP standalone.
**Mitigación:** El EngramPort tiene graceful degradation (RF-2.2). En tests, el
cliente MCP se mockea completamente. En producción, si no hay servidor Engram
levantado, la tool simplemente loguea y sigue. No es un fallo crítico del sistema.
