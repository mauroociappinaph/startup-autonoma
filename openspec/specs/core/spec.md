# Especificación: Robustecimiento del Control de Ciclos y Telemetría (#127)

## Escenario 1: Incremento del contador de iteraciones
**Given** un estado inicial con `iteration_count` en `X`.
**When** el CEO (o cualquier Chief) termina su ejecución exitosamente.
**Then** el nuevo estado devuelto DEBE tener un `iteration_count` igual a `X + 1`.

## Escenario 2: Acumulación de costos
**Given** un estado inicial con `total_cost_usd` en `Y`.
**When** el nodo procesa una respuesta del LLM con un costo de `Z`.
**Then** el nuevo estado devuelto DEBE tener un `total_cost_usd` igual a `Y + Z`.

## Escenario 3: Telemetría con modelo dinámico
**Given** una llamada al `LLMService` que utiliza un modelo específico (ej: `claude-3-5-sonnet`).
**When** el nodo registra la métrica en el `TelemetryService`.
**Then** el campo `model` enviado al servicio DEBE coincidir con el modelo devuelto por el `LLMService`, no con una cadena estática.

## Escenario 4: Centralización en stateHelper
**Given** la necesidad de actualizar métricas en múltiples nodos.
**When** se implementa el refactor.
**Then** los nodos `ceo`, `software_chief` y `business_chief` DEBEN delegar la preparación del estado de actualización a la función `prepareNodeUpdate` del `stateHelper`.
# Especificaciones: Streaming de Pensamientos y Métricas (#128)

## Requerimientos Funcionales

### RF-1: Telemetría Incremental
- El sistema DEBE emitir actualizaciones de tokens y costo al menos cada 200ms durante la generación del LLM.
- El cálculo parcial PUEDE ser una estimación basada en caracteres (1 token ≈ 4 bytes) para optimizar performance.
- Al finalizar el nodo, el sistema DEBE sincronizar el valor parcial con el valor real retornado por el proveedor (OpenAI/Anthropic).

### RF-2: Streaming de Razonamiento Estructurado
- El sistema DEBE extraer el campo `reasoning` del stream JSON de forma robusta, ignorando otros campos que puedan aparecer antes.
- El stream visual DEBE eliminar los tags XML del texto principal y mostrarlos en los contenedores dedicados del Dashboard.

### RF-3: Feedback Visual Progresivo
- El componente `ReasoningFeed` DEBE detectar tags de apertura (ej: `<thought>`) y renderizar el contenedor visual inmediatamente, sin esperar al tag de cierre.
- El texto dentro de los contenedores CoT DEBE actualizarse en tiempo real.

## Escenarios de Prueba

### Escenario 1: Generación de Plan Largo
- **Dado** que el CEO está generando un plan de 500 tokens.
- **Cuando** el stream comienza.
- **Entonces** el ticker `Mission Investment` debe incrementar su valor decimal paulatinamente.
- **Y** el componente `ReasoningFeed` debe mostrar el texto fluyendo.

### Escenario 2: Interrupción de Red
- **Dado** un stream activo con métricas parciales.
- **Cuando** la conexión SSE se corta.
- **Entonces** el frontend debe mantener los últimos valores conocidos (no resetear a cero).

### Escenario 3: Tags XML Malformados
- **Dado** que el LLM olvida cerrar un tag (ej: `<plan> ... (fin del stream)`).
- **Cuando** el parser procesa el texto.
- **Entonces** el frontend debe cerrar implícitamente el bloque para evitar errores de renderizado.
# Especificaciones: Persistencia y Checkpoints (#37)

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
