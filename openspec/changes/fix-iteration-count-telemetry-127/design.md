# Diseño Técnico: Helper de Estado y Telemetría Dinámica (#127)

## Arquitectura

Para cumplir con las leyes SRP y DRY, introduciremos una capa de abstracción para la gestión de métricas del grafo. Esto desacopla la lógica de negocio de los nodos del mantenimiento de la infraestructura (costos, iteraciones, telemetría).

### Componentes

#### 1. State Helper (`backend/src/helpers/stateHelper.ts`)
Este módulo contendrá la función pura (o casi pura) para preparar los updates.

**Interfaz:**
```typescript
interface NodeMetadata {
  nodeName: string;
  usage: { prompt: number; completion: number; total: number };
  latency: number;
  model: string;
  cost: number;
}

export function prepareNodeUpdate(
  state: AgentStateType,
  metadata: NodeMetadata,
  additionalUpdates: Partial<AgentStateType> = {}
): Partial<AgentStateType>;
```

**Responsabilidades:**
1. Incrementar `iteration_count` baseándose en `state.iteration_count || 0`.
2. Acumular `total_cost_usd`.
3. Actualizar `token_usage` (sumando o reemplazando según convención de LangGraph para ese campo).
4. Llamar a `TelemetryService.recordMetric` de forma asíncrona pero asegurando que use el `metadata.model`.
5. Retornar el objeto de actualización final.

### Flujo de Datos

1. El Nodo llama a `LLMService.getStructuredData`.
2. El `LLMService` retorna los datos + `model` (detectado de `.env`) + `usage` + `latency`.
3. El Nodo llama a `prepareNodeUpdate(state, { nodeName, usage, latency, model, cost })`.
4. El Nodo retorna el resultado de ese helper combinado con su lógica de delegación.

## Decisiones de Diseño

- **Uso de `model` real**: Se elimina cualquier string literal como `"gpt-4o"` de los nodos. El helper recibirá el `model` que el `LLMService` reporte como usado (basado en la configuración de `.env`).
- **Persistencia de Iteraciones**: Al usar `(state.iteration_count || 0) + 1`, garantizamos que el grafo respete el `recursion_limit` configurado en el `compiledGraph`.
- **Ubicación**: Se coloca en `backend/src/helpers/` siguiendo la estructura de carpetas existente.

## Consideraciones de Modelos Gratuitos
Dado que el usuario utiliza modelos de NVIDIA/Groq, el helper debe ser agnóstico al nombre del modelo y simplemente propagar lo que el provider reporte.
