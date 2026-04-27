# Especificación: Estandarización de Herramientas via MCP (#124)

## RF-1: Tool Registry — Registro Centralizado

**RF-1.1 — Registro por nombre:**
El `ToolRegistry` debe poder devolver una herramienta usando su nombre como clave.

```
Dado que el ToolRegistry tiene registradas las herramientas del sistema,
Cuando se llama a registry.getTool("write_file"),
Entonces se devuelve la herramienta `write_file` de LangChain.
```

**RF-1.2 — Registro por categoría (Discovery):**
El `ToolRegistry` debe poder devolver el listado de herramientas disponibles
agrupadas por categoría.

```
Dado que el ToolRegistry tiene herramientas de categorías "filesystem", "git"
y "platform",
Cuando se llama a registry.getToolsByCategory("filesystem"),
Entonces se devuelven únicamente las herramientas de esa categoría.
```

**RF-1.3 — Herramienta no encontrada:**
El registry debe lanzar un error descriptivo si se pide una tool no registrada.

```
Dado que el ToolRegistry está inicializado,
Cuando se llama a registry.getTool("herramienta_inexistente"),
Entonces se lanza un Error con el mensaje que incluye el nombre solicitado.
```

**RF-1.4 — Listado de Discovery completo:**
El registry debe poder devolver un listado de todas las herramientas disponibles
con nombre, descripción y categoría (para que los agentes puedan razonar sobre qué usar).

```
Dado que el ToolRegistry está inicializado,
Cuando se llama a registry.listTools(),
Entonces se devuelve un array de { name, description, category } por cada tool.
```

---

## RF-2: Engram MCP Port — Conexión real al servidor MCP

**RF-2.1 — Invocación al MCP real:**
La herramienta `save_to_engram` debe invocar la operación `mem_save` del servidor
MCP de Engram (via el cliente MCP de Node.js) en lugar del stub actual.

```
Dado que el servidor MCP de Engram está disponible,
Cuando un agente invoca la herramienta `save_to_engram` con argumentos válidos,
Entonces se realiza una llamada real al servidor MCP y se devuelve el resultado.
```

**RF-2.2 — Graceful degradation si MCP no disponible:**
Si el servidor MCP de Engram no está disponible (apagado, red caída), la herramienta
debe loguear el error via `SacredLogger.warn` y devolver un resultado de fallo
estructurado, sin tirar una excepción sin capturar que rompa el grafo.

```
Dado que el servidor MCP de Engram NO está disponible,
Cuando un agente invoca save_to_engram,
Entonces se devuelve { success: false, error: "MCP_UNAVAILABLE" }
Y SacredLogger.warn fue invocado.
```

**RF-2.3 — Fallback de configuración:**
El endpoint del servidor MCP de Engram debe ser configurable via variable de
entorno `ENGRAM_MCP_URL`, con fallback a `http://localhost:3001` para desarrollo local.

```
Dado que la variable de entorno ENGRAM_MCP_URL no está definida,
Cuando se inicializa el EngramPort,
Entonces usa "http://localhost:3001" como URL por defecto.
```

---

## RF-3: Integración al sistema existente

**RF-3.1 — Sin breaking changes en workers existentes:**
Ningún worker existente (code_writer, git_worker, test_runner, operations_worker)
debe ser modificado en esta issue. El ToolRegistry es aditivo.

**RF-3.2 — Barrel file actualizado:**
El `src/mcp_ports/index.ts` (hoy solo con `.gitkeep`) debe exportar el
`ToolRegistry` y el `EngramPort`.

---

## Criterios de Rechazo (lo que NO es aceptable)

- El `ToolRegistry` no puede tener estado global mutable (debe ser un singleton
  inmutable o una instancia única correctamente inicializada).
- No se aceptan `any` en el código productivo (Ley #3).
- No se aceptan imports relativos profundos como `../../tools/fs` (Ley #10).
