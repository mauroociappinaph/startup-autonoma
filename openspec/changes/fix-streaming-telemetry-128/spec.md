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
