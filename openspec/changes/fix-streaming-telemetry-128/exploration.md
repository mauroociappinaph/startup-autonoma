# Exploración: Streaming de Pensamientos y Métricas (#128)

## Estado Actual

### Backend (Lógica de Streaming)
- **Extracción de Razonamiento**: En `GraphService.ts`, se utiliza una expresión regular (`/"reasoning":\s*"(.*)/`) para intentar capturar el campo `reasoning` de un stream JSON parcial. 
- **Telemetría**: Las métricas (tokens, costo, latencia) se calculan y emiten únicamente al finalizar el nodo (`on_node_end`) a través de `TelemetryService.recordMetric`.
- **Eventos**: El backend emite eventos de tipo `isPartial: true` para el razonamiento acumulado y eventos completos al finalizar cada nodo.

### Frontend (Visualización)
- **ReasoningFeed**: Soporta streaming parcial (usando `isPartial` para concatenar texto). Tiene componentes para mostrar bloques XML (`<thought>`, `<plan>`, `<verification>`), pero estos solo se renderizan cuando el objeto del pensamiento está completo (no durante el stream).
- **Métricas**: `FinancialTicker` y `SystemHealth` están conectados al store, pero sufren de "saltos" bruscos ya que los datos solo llegan al final de cada iteración del agente.

## Gaps Identificados

1. **Fragilidad del Parser de Stream**: Si el LLM cambia ligeramente el formato del JSON (espacios, saltos de línea antes del campo `reasoning`), el regex actual falla y no se muestra nada hasta que el nodo termina.
2. **Falta de Métricas en Tiempo Real**: El usuario no ve el "gasto" mientras la IA escribe. En procesos largos, esto reduce la sensación de control.
3. **Visibilidad de CoT Parcial**: Los bloques XML dentro del razonamiento no se muestran de forma estructurada hasta que el stream termina. Se ven como texto plano con tags durante el streaming.

## Propuesta de Mejora

1. **Streaming de Métricas Estimadas**: 
   - Durante el stream de tokens (`on_chat_model_stream`), el backend puede calcular una estimación del costo basada en la longitud del texto recibido hasta el momento.
   - Enviar actualizaciones de métricas parciales para que los tickers en el frontend se muevan de forma fluida.

2. **Refactor de `ReasoningBuffer`**:
   - Usar un parser de JSON parcial más robusto o mejorar la lógica de acumulación para extraer no solo `reasoning`, sino también otros campos si fuera necesario.

3. **Renderizado de CoT en Tiempo Real**:
   - Modificar `ReasoningFeed` para que aplique el `extractTag` incluso en mensajes parciales, permitiendo que los bloques estructurados aparezcan "mientras" se escriben.

## Próximos Pasos
- Definir el nuevo contrato de eventos para telemetría parcial.
- Implementar la estimación de tokens/costo en `GraphService`.
- Refactorizar el componente `ReasoningFeed` para parsing dinámico.
