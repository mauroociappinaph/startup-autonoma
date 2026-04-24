# Especificaciones: Persistencia y Checkpoints (Issue #37)

## Requerimientos Funcionales

### RF1: Vinculación de Checkpoints en Streaming
El backend debe enviar el `checkpoint_id` asociado a cada nodo finalizado. Este ID debe estar disponible en el objeto `AgentThought` del frontend.

### RF2: Visualización de Historial
El sistema debe permitir recuperar la línea temporal completa de un `threadId` incluso después de un refresco de página.

### RF3: Acción de Rewind
El usuario debe poder disparar una acción de `rewind` seleccionando un pensamiento específico del feed. Esto debe:
1. Notificar al backend para resetear el puntero del grafo.
2. Limpiar el store local de pensamientos posteriores al punto elegido.
3. Actualizar la telemetría (costos y tokens) al valor exacto que había en ese checkpoint.

## Escenarios (Gherkin-style)

### Escenario 1: El usuario decide retroceder una decisión del CEO
- **Dado** que el agente está en estado "Waiting for approval" después de un plan del CEO.
- **Cuando** el usuario hace click en "Rewind" sobre el pensamiento anterior del CEO.
- **Entonces** el feed debe eliminar el plan actual.
- **Y** el estado del grafo debe volver al punto previo a la generación del plan.

### Escenario 2: Persistencia tras refresco
- **Dado** que se ejecutaron 5 nodos y se cerró el navegador.
- **Cuando** el usuario vuelve a entrar con el mismo `threadId`.
- **Entonces** el Dashboard debe cargar los 5 pensamientos previos desde el historial de checkpoints.

## Restricciones Técnicas
- El `checkpoint_id` es opaco y debe tratarse como un string único.
- No se debe permitir rewind mientras el stream está activo (`isStreaming === true`).
