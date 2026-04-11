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
| `active_chief` | `str` | Chief activo. | Sobrescribir |
| `results` | `List[dict]` | Resultados granulares brutos de los Workers. | `operator.add` |
| `executive_summary` | `str` | Resumen de los results (max 3 oraciones) para transiciones limpias y evitar overflow. | Sobrescribir |
| `feedback` | `List[str]` | Comentarios del usuario. | `operator.add` |
| `status` | `str` | Estado actual (planning, executing). | Sobrescribir |
| `retry_count` | `int` | Contador para Strict TTL. Previene deadlocks. | Acumular / Resetear |
| `trace_id` | `str` | Identificador único de traza. | Sobrescribir |
| `metadata` | `dict` | Contexto adicional. | Sobrescribir |

## Reducers y Prevención de Contexto

- **Sobrescritura:** Campos de control (status, active_chief, trace_id, executive_summary) se reemplazan. Reflejan la decisión actual del grafo y mantienen los prompts de los agentes limpios (Principio del **Least Privilege Context**).
- **Acumuladores (`operator.add`):** `results`, `feedback` y `retry_count`. Crecen en el tiempo pero NO se deben inyectar enteros al prompt de un trabajador, solo guardarlos por observabilidad y auditoría.

## Persistencia (Checkpoints)

LangGraph permite persistir este estado. Esto habilita:
1.  **Time Travel:** Regresar a un punto del grafo para corregir decisiones.
2.  **Long-Running Tasks:** Retomar procesos tras pausas largas.
3.  **Human-in-the-loop:** Pausa en puntos críticos (ej: aprobación de costos) con estado "congelado".

## Sincronización con Engram

El estado operativo es EFÍMERO. Al finalizar una tarea exitosa, el CEO debe consolidar las lecciones aprendidas y el `results` final para guardarlas permanentemente en **Engram** como memoria semántica.
