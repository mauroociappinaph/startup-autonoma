# Proposal: Sequential Thinking Tool

## Intent
Proveer a los agentes de la Startup una herramienta estructurada para realizar pensamiento secuencial (Chain of Thought), mejorando la calidad de la toma de decisiones complejas y el razonamiento arquitectónico antes de ejecutar acciones técnicas.

## Scope

### In Scope
- Crear la herramienta `sequential_thinking` en el backend.
- Registrar la herramienta en el `ToolRegistry` bajo la categoría `reasoning`.
- Exportar la herramienta para que esté disponible para el CEO y los Chiefs.

### Out of Scope
- Integración automática del historial de pensamiento en el Dashboard (esto es parte de la Fase B).
- Modificación de los prompts de los agentes para forzar el uso de la herramienta.

## Capabilities

### New Capabilities
- `reasoning-sequential-thinking`: Capacidad para desglosar problemas complejos en pasos de pensamiento secuencial.

### Modified Capabilities
None.

## Approach
Implementar una `StructuredTool` nativa en TypeScript que reciba parámetros de pensamiento (thought, step, total_steps) y devuelva el mismo contenido al historial de mensajes del grafo. Se registrará en la nueva categoría `reasoning`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `backend/src/tools/platform/sequential_thinking_tool.ts` | New | Implementación de la herramienta. |
| `backend/src/mcp_ports/toolRegistry.ts` | Modified | Registro de la herramienta y categoría `reasoning`. |
| `backend/src/tools/index.ts` | Modified | Exportación de la nueva herramienta. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Loop de pensamiento infinito | Low | El grafo de LangGraph tiene límites de recursión nativos. |
| State Bloat | Medium | Mantener los pensamientos concisos y resumirlos si es necesario. |

## Rollback Plan
Eliminar los archivos creados y revertir las modificaciones en `toolRegistry.ts` e `index.ts`. Al ser una herramienta nueva, no afecta la lógica existente de otros workers.

## Dependencies
- `@langchain/core` (ya instalado).

## Success Criteria
- [ ] La herramienta `sequential_thinking` está registrada en `defaultRegistry`.
- [ ] La herramienta es invocable y devuelve el pensamiento estructurado.
- [ ] `npm run check` y `npm run test` pasan sin errores.
