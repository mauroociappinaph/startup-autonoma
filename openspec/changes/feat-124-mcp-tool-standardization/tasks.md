# Tareas: Estandarización de Herramientas via MCP (#124)

## Batch 1: Infraestructura del Registro

- [ ] Verificar que `@modelcontextprotocol/sdk` esté instalado en el workspace
  `backend`. Si no está, instalarlo con `npm install @modelcontextprotocol/sdk
  --workspace=backend`.
- [ ] Crear `backend/src/mcp_ports/toolRegistry.ts`:
  - Definir interface `ToolDescriptor` (name, description, category).
  - Definir interface `RegisteredTool` (tool + descriptor).
  - Implementar clase `ToolRegistry` con método estático `create(tools)`.
  - Implementar `getTool(name)` → lanza error si no existe.
  - Implementar `getToolsByCategory(category)` → filtra por categoría.
  - Implementar `listTools()` → devuelve array de `ToolDescriptor`.
  - Exportar una instancia por defecto `defaultRegistry` con todas las tools
    del sistema registradas con sus categorías correctas.

## Batch 2: Puerto de Engram

- [ ] Crear `backend/src/mcp_ports/engramPort.ts`:
  - Leer `ENGRAM_MCP_URL` de `process.env` con fallback a `http://localhost:3001`.
  - Implementar `EngramPort.save(args)` usando el MCP SDK.
  - Implementar timeout de 5 segundos con graceful degradation.
  - Loguear éxito/fallo via `SacredLogger`.
- [ ] Actualizar `backend/src/tools/platform/engram_tool.ts`:
  - Reemplazar el stub con una llamada a `EngramPort.save(args)`.
  - Eliminar el `console.log` residual.

## Batch 3: Barrel file

- [ ] Actualizar `backend/src/mcp_ports/index.ts`:
  - Exportar `ToolRegistry`, `defaultRegistry` desde `./toolRegistry.js`.
  - Exportar `EngramPort` desde `./engramPort.js`.

## Batch 4: Tests

- [ ] Crear `backend/src/tests/toolRegistry.test.ts`:
  - Test RF-1.1: `getTool("write_file")` devuelve la herramienta correcta.
  - Test RF-1.2: `getToolsByCategory("filesystem")` devuelve solo las 4 tools de FS.
  - Test RF-1.3: `getTool("no_existe")` lanza error con el nombre en el mensaje.
  - Test RF-1.4: `listTools()` devuelve array con al menos 6 descriptores.
- [ ] Crear `backend/src/tests/engramPort.test.ts`:
  - Test RF-2.1: mock del SDK → `save()` devuelve `{ success: true }`.
  - Test RF-2.2: mock que falla → devuelve `{ success: false, error: "MCP_UNAVAILABLE" }` y llama `SacredLogger.warn`.
  - Test RF-2.3: sin `ENGRAM_MCP_URL` → usa `http://localhost:3001` por defecto.

## Batch 5: Verificación Final

- [ ] Correr `npm run check` → sin errores de TypeScript.
- [ ] Correr `npm run test` → 20 suites, todos en verde (más las 2 nuevas = 22).
- [ ] Correr `npm run lint` → sin warnings.
