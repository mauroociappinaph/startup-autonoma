# Design: Sequential Thinking Tool

## Technical Approach
Implementar la herramienta `sequential_thinking` como una `StructuredTool` de LangChain nativa en el backend de Node.js. La herramienta actuará como un "puntero de razonamiento" para el LLM, permitiendo registrar pasos de pensamiento estructurado (Chain of Thought). Se integrará en el `ToolRegistry` bajo la categoría `reasoning`.

## Architecture Decisions

### Decision: Implementación Nativa
**Choice**: Herramienta nativa integrada en el código del backend.
**Alternatives considered**: Servidor MCP externo (Python/Node).
**Rationale**: Al no requerir E/S externa, una implementación nativa es más eficiente, elimina la latencia de red y simplifica el despliegue. El `ToolRegistry` ya abstrae la ubicación de la herramienta para los agentes.

### Decision: Categoría de Herramientas
**Choice**: Introducción de la categoría `reasoning`.
**Alternatives considered**: Usar `platform`.
**Rationale**: Provee una mejor separación de responsabilidades. Las herramientas de razonamiento no son de "plataforma" (como Engram) ni de "filesystem".

## Data Flow
```text
Agent LLM (Chief/CEO) 
   ──> ToolRegistry.getTool("sequential_thinking")
   ──> Tool Execution (Local logic)
   ──> Returns Structured Thought String
   ──> LangGraph (Message History)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `backend/src/tools/platform/sequential_thinking_tool.ts` | Create | Lógica de la herramienta y validación Zod. |
| `backend/src/mcp_ports/toolRegistry.ts` | Modify | Registro de la herramienta y actualización de `defaultRegistry`. |
| `backend/src/tools/index.ts` | Modify | Exportación centralizada de la herramienta. |

## Interfaces / Contracts

```typescript
export const SequentialThinkingSchema = z.object({
  thought: z.string().describe("El pensamiento detallado de este paso."),
  step: z.number().int().min(1).describe("El número de paso actual en la secuencia."),
  total_steps: z.number().int().min(1).describe("El total estimado de pasos para resolver la tarea."),
  is_revision: z.boolean().optional().describe("Si este paso revisa un razonamiento anterior."),
  revises_step: z.number().int().optional().describe("El número de paso que está siendo revisado.")
});
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `sequential_thinking` logic | Validar que devuelve un string con el formato esperado. |
| Integration | `ToolRegistry` Discovery | Verificar que `listTools()` devuelve la nueva categoría y herramienta. |

## Migration / Rollout
No requiere migración. La herramienta estará disponible para todos los agentes que consuman el `defaultRegistry` tras el despliegue.
