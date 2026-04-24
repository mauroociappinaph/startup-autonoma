# Propuesta: Streaming de Pensamientos y Métricas (#128)

## Objetivo
Implementar una experiencia de usuario fluida y transparente mediante el streaming en tiempo real de las métricas de consumo (tokens/costo) y el razonamiento estructurado (CoT XML).

## Alcance
- **Backend**: Implementación de estimación de tokens en el loop de stream.
- **Backend**: Emisión de eventos de telemetría parcial durante la generación del LLM.
- **Frontend**: Actualización dinámica de los tickers financieros y de salud del sistema.
- **Frontend**: Refactor del parser de pensamientos para soportar bloques XML parciales.

## Enfoque Técnico

### 1. Estimación de Telemetría (Backend)
En `GraphService.runAgentStream`, por cada chunk recibido:
- Calcular tokens aproximados (1 token ≈ 4 caracteres).
- Calcular costo aproximado usando `TelemetryService.calculateCost`.
- Emitir un evento de tipo `METRIC_PARTIAL` al `EventBus`.

### 2. Streaming Robusto de Campos (Backend)
- Reemplazar el regex de `reasoning` por un acumulador que busque patrones de inicio y fin de strings en JSON, o simplemente usar un parser de JSON incremental si la latencia lo permite.
- Asegurar que el stream no se corte si el modelo añade campos extra antes del `reasoning`.

### 3. UI Reactiva (Frontend)
- Modificar `agentProcessor` para manejar `METRIC_PARTIAL`.
- Modificar `ReasoningFeed` para que el renderizado de `<thought>`, `<plan>` y `<verification>` ocurra incluso si el tag de cierre `</...>` aún no ha llegado (usando el texto acumulado hasta el momento).

## Riesgos y Mitigaciones
- **Sobrecarga de Eventos**: Emitir un evento por cada token puede saturar el bridge.
- **Mitigación**: Emitir actualizaciones de métricas cada 5-10 tokens o cada 100ms.
- **Precisión**: La estimación por caracteres no es 100% exacta.
- **Mitigación**: Sincronizar con el valor real exacto (el del backend) al recibir el evento `on_node_end`.

## Criterios de Aceptación
- [ ] Los tickers de costo y tokens se mueven mientras la IA escribe.
- [ ] Los bloques de color (azul para thoughts, purpura para plan) aparecen en cuanto se detecta el tag de apertura `<tag>`.
- [ ] El sistema no crashea si el stream de red se interrumpe.
