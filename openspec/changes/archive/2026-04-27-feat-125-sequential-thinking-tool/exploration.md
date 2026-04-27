## Exploration: Sequential Thinking Tool

### Current State
El sistema cuenta con un `ToolRegistry` que centraliza herramientas de filesystem, testing y plataforma. Los agentes ejecutan acciones, pero no tienen una herramienta estructurada para realizar "pensamiento secuencial" o "cadena de pensamiento" antes de comprometerse con una acción compleja, más allá de su razonamiento interno en el grafo.

### Affected Areas
- `backend/src/mcp_ports/toolRegistry.ts` — Registrar la nueva herramienta y la categoría `reasoning`.
- `backend/src/tools/index.ts` — Exportar la nueva herramienta.
- `backend/src/tools/platform/sequential_thinking_tool.ts` — [NUEVA] Implementación de la lógica de pensamiento.
- `backend/src/types/mcp.types.ts` — Ya preparado con la categoría `reasoning`.

### Approaches
1. **Native Tool (Recomendado)** — Implementar como una herramienta de LangChain dentro del backend.
   - Pros: Baja latencia, fácil de testear, cumple con las leyes de tipado del proyecto.
   - Cons: No es un servidor externo independiente.
   - Effort: Low

2. **External MCP Server** — Crear un microservicio separado que exponga la capacidad de pensamiento vía protocolo MCP.
   - Pros: Desacoplamiento total, reusable por otros clientes.
   - Cons: Complejidad innecesaria para una lógica de razonamiento puro, mayor latencia de red.
   - Effort: Medium

### Recommendation
Se recomienda el **Approach 1 (Native Tool)**. La arquitectura de `ToolRegistry` que acabamos de implementar permite que esta herramienta se consuma exactamente igual que una herramienta MCP externa, manteniendo la simplicidad del despliegue actual.

### Risks
- **Over-thinking**: Los agentes podrían entrar en bucles de pensamiento infinito si no se configura bien el límite de pasos.
- **State Bloat**: El historial de pensamientos podría inflar el contexto del LLM si no se resume o se maneja adecuadamente en el grafo.

### Ready for Proposal
Yes. La arquitectura está lista para recibir herramientas de la categoría `reasoning`.
