# Tareas: Streaming de Pensamientos y Métricas (#128)

## Fase 1: Backend (Infraestructura de Stream)

- [x] **Task 1.1**: Modificar `GraphService.ts` para incluir estimación de tokens en `on_chat_model_stream`.
- [x] **Task 1.2**: Implementar `METRIC_PARTIAL` event emission cada 10 chunks o 200ms.
- [x] **Task 1.3**: Refactorizar `reasoningBuffer` para mejorar la extracción de campos JSON parciales.

## Fase 2: Frontend (Consumo de Telemetría)

- [x] **Task 2.1**: Actualizar `agentProcessor.ts` para manejar el evento `METRIC_PARTIAL`.
- [x] **Task 2.2**: Refactorizar `xmlParser.ts` (método `extractTag`) para soportar tags abiertos sin cierre.
- [x] **Task 2.3**: Ajustar `ReasoningFeed.tsx` para optimizar el renderizado de bloques parciales.

## Fase 3: Validación y Pulido

- [x] **Task 3.1**: Verificar que el contador financiero sea fluido en el Dashboard.
- [x] **Task 3.2**: Validar que el scroll automático del feed sea suave y no rebote.
- [x] **Task 3.3**: Asegurar que al final del nodo las métricas estimadas se sincronicen con las reales (sin saltos bruscos).
