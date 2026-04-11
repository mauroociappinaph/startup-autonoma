# State Management: The Startup Folder

El estado en LangGraph actúa como la "carpeta de la empresa" que pasa de nodo en nodo. Cada agente lee lo que necesita y escribe sus resultados para los demás.

## Definición del `StartupState`

El estado se implementa utilizando `TypedDict` y anotaciones Zod para controlar la combinación de resultados.

### Esquema del Estado

| Campo | Tipo | Descripción | Reducer |
| :--- | :--- | :--- | :--- |
| `original_prompt` | `str` | Prompt original del usuario. | Sobrescribir |
| `refined_prompt` | `str` | Prompt optimizado por el Mirror. | Sobrescribir |
| `plan` | `List[str]` | Tareas estratégicas del CEO. | Sobrescribir |
| `messages` | `List[AnyMessage]` | Historial conversacional del Agente. | `add_messages` |
| `active_chief` | `str` | Chief activo. | Sobrescribir |
| `results` | `List[dict]` | Resultados granulares brutos de los Workers. | `operator.add` |
| `executive_summary` | `str` | Resumen de los results (max 3 oraciones) para transiciones limpias y evitar overflow. | Sobrescribir |
| `feedback` | `List[str]` | Comentarios del usuario. | `operator.add` |
| `status` | `str` | Estado actual (planning, executing). | Sobrescribir |
| `retry_count` | `int` | Contador para Strict TTL. Previene deadlocks. | Acumular / Resetear |
| `trace_id` | `str` | Identificador único de traza. | Sobrescribir |
| `metadata` | `dict` | Contexto adicional. | Sobrescribir |

## Context Window (Truncamiento Obligatorio)

La matriz `messages` usa `add_messages`, lo que implica un crecimiento infinito por diseño. Por orden arquitectónica:
- Queda **prohibido** inyectar el estado `messages` crudo en `llm.invoke()`.
- Se debe aplicar obligatoriamente la utilidad `trim_messages` (ej: reteniendo las últimas 10 transacciones o limitando a `max_tokens=6000`) **antes** de procesar cualquier nodo llm, evitando colapsos 429 de Rate Limit y Window Overflow.

## Reducers y Prevención de Contexto

- **Sobrescritura:** Campos de control (status, active_chief, trace_id, executive_summary) se reemplazan. Reflejan la decisión actual del grafo y mantienen los prompts limpios (Ley del *Least Privilege Context*).
- **Acumuladores:** `results` y `feedback`. Crecen en el tiempo pero NO se inyectan a agentes; fungen como log de auditoría local.

## Persistencia Integrada (Checkpoints)

LangGraph implementa persistencia usando Checkpointers (`MemorySaver` para dev, `PostgresSaver` para prod). Esto vuelve **obsoleto** a esquemas externos tipo BullMQ para procesos aislados. 
El Checkpointer natural habilita:
1.  **Human-in-the-Loop:** Pone el grafo en estado "congelado/sleeping" vía `interrupt_before`.
2.  **Long-Running / Resumption:** Retoma operaciones desde llamadas de red caídas.

## Sincronización con Engram

El estado operativo es EFÍMERO. Al finalizar una tarea exitosa, el CEO debe consolidar las lecciones aprendidas y el `results` final para guardarlas permanentemente en **Engram** como memoria semántica.
