# Propuesta: Time-Travel & Checkpoint Integration (Issue #37)

## Intención
Habilitar la capacidad de "Time Travel" en la Startup Autónoma, permitiendo al usuario visualizar el historial de estados y retroceder a puntos anteriores de la ejecución si el razonamiento del agente no es satisfactorio.

## Alcance
- **Backend**: Capturar e inyectar el `checkpoint_id` en los eventos de streaming.
- **Shared**: Extender los tipos para soportar metadatos de checkpoints.
- **Frontend Store**: Implementar lógica de fetch de historial y mutación de estado vía rewind.
- **Frontend UI**: Añadir botones de rewind en el `ReasoningFeed` y un indicador visual de "Estado Restaurado".

## Enfoque Técnico
1. **Captura de Checkpoints**: Modificar `GraphService.ts` para que, en cada `on_node_end`, extraiga el `checkpoint_id` de la configuración del evento y lo incluya en el mensaje formateado.
2. **Sincronización del Store**: Al ejecutar un `rewind`, el frontend llamará a `/api/agents/history/:threadId` para obtener el nuevo "estado de verdad" y repoblar el store de Zustand, eliminando los pensamientos que ocurrieron después del punto de restauración.
3. **UX de Retroceso**: En el `ReasoningFeed`, cada pensamiento finalizado tendrá un pequeño icono de "rewind" (flecha hacia atrás) que pedirá confirmación antes de resetear el grafo.

## Criterios de Aceptación
- [ ] El usuario puede ver qué pensamientos pertenecen a qué checkpoint (vía inspección o metadatos).
- [ ] El botón de "Rewind" resetea exitosamente el grafo en el backend.
- [ ] El frontend se actualiza visualmente reflejando el estado anterior (menos pensamientos, telemetría reseteada).
- [ ] El flujo puede continuar normalmente desde el punto de restauración.
