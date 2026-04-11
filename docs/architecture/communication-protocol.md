# Communication & Hierarchy Protocol

Este documento define cómo interactúan los agentes para garantizar orden, escalabilidad y alineación estratégica.

## Principios de Comunicación

1.  **Jerarquía Estricta:** Un Worker solo reporta a su Chief. Un Chief solo reporta al CEO. El CEO es el único que interactúa directamente con el resultado final para el usuario.
2.  **Contexto Mínimo:** Los agentes reciben solo la porción relevante para su tarea (*Least Privilege*).
3.  **Inmutabilidad:** Los resultados no se sobrescriben; se agregan al historial para auditoría.

## Flujo de Delegación (Top-Down)

1.  **CEO a Chief:** Entrega un "Sub-objetivo" claro + métricas de éxito + `trace_id`.
2.  **Chief a Worker:** Desglosa en "Tareas Atómicas". Entrega las herramientas necesarias.
3.  **Ejecución:** El Worker devuelve un `Result` (data, success, log) vinculado al mismo `trace_id` a través de canales **gRPC** de alta performance.

## Flujo de Validación (Bottom-Up)

1.  **Validación Técnica (Chief):** Revisa el resultado recibido por gRPC. Si falla, reinicia el nodo (edge cíclico) o escala al CEO.
2.  **Validación Estratégica (CEO):** Revisa el consolidado contra el plan original.
3.  **Aprobación Final (Usuario):** Pausa obligatoria en puntos críticos para esperar validación humana.

## Manejo de Conflictos y Errores

- **Deadlocks:** Si un Chief y un Worker no llegan a acuerdo tras 3 iteraciones, se escala automáticamente al CEO.
- **Fallas de Herramientas/gRPC:** Reportar `success: False` con el error exacto (o código de estado gRPC); el Chief decide si reintentar o pivotar estrategia.

## Interacción con la Memoria (Engram)

Antes de cualquier tarea:
1.  **Búsqueda:** Los agentes (CEO/Chief) deben ejecutar `mem_search` para buscar precedentes.
2.  **Prohibición:** Está prohibido reinventar la rueda si ya existe una decisión documentada.
3.  **Registro:** Al finalizar tareas importantes, se debe persistir el aprendizaje vía `mem_save` siguiendo el formato estipulado.
