## Exploration: Fase C - Infraestructura, Operaciones y Resiliencia

### Current State
El sistema ya cuenta con una infraestructura base dockerizada (`docker-compose.yml`) que incluye servicios críticos como Redis, Postgres, Jaeger y el ai-engine. Además, se implementó el `OperationsChief` capaz de delegar tareas de infraestructura y generar diagramas de secuencia Mermaid. Sin embargo, estas piezas están "sueltas": el chequeo de Docker en el pre-push es solo una advertencia, y la visibilidad del grafo se limita a archivos estáticos generados en `docs/`.

### Affected Areas
- `docker-compose.yml` — Necesita ajustes para asegurar que todos los servicios tengan healthchecks robustos.
- `scripts/check-docker.js` — Debe evolucionar de advertencia a validador crítico.
- `frontend/src/components/dashboard/OrchestrationGraph.tsx` — Podría integrar visualización de trazas o estados de salud.
- `backend/src/nodes/chiefs/operations_chief.ts` — Ampliar lógica para monitoreo activo.
- `backend/src/nodes/workers/operations_worker_node.ts` — Mejorar la gestión de logs y diagnósticos.

### Approaches
1. **Enfoque "Docker-Strict"** — Convertir el ecosistema Docker en el entorno de desarrollo obligatorio, bloqueando pushes si la infraestructura local no está sana.
   - Pros: Garantiza paridad de entornos.
   - Cons: Puede ser intrusivo para desarrollo rápido de lógica pura.
   - Effort: Low

2. **Enfoque "Observability Dashboard"** — Integrar los diagramas de secuencia y trazas de Jaeger directamente en la UI de Mission Control.
   - Pros: Mejora drástica en la "Graph Visibility" prometida en AGENTS.md.
   - Cons: Requiere cambios significativos en el frontend para consumir datos de Jaeger o archivos Mermaid dinámicos.
   - Effort: Medium

3. **Enfoque "Self-Healing Operations"** — Implementar un worker que no solo ejecute comandos, sino que monitoree métricas y sugiera correcciones (auto-healing).
   - Pros: Máxima autonomía operativa.
   - Cons: Complejidad alta en el manejo de estados de error circulares.
   - Effort: High

### Recommendation
Se recomienda una combinación del **Enfoque 1** (para estabilizar la base) y el **Enfoque 2** (para cumplir con la visibilidad del grafo). Es prioritario que el `OperationsChief` pueda mostrarle al humano qué está pasando mediante la UI, no solo mediante archivos.

### Risks
- **Overhead de Docker**: Forzar Docker local puede ralentizar máquinas con pocos recursos.
- **Acoplamiento de Trazas**: Jaeger puede ser pesado para el dashboard; se debe streamear solo lo necesario.

### Ready for Proposal
Sí. El plan debe centrarse en:
1. Robustecer `check-docker.js`.
2. Integrar visualización de secuencia Mermaid en el Dashboard.
3. Asegurar que el `OperationsChief` tenga herramientas de "Inmortalidad" (checkpoints persistentes y recuperación).
