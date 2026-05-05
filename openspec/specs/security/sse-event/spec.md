# Especificación: SSE Security Streaming (#143)

## Requerimientos Funcionales

- **RF-1**: Cuando el `AduanaSentinel` evalúa un prompt, DEBE publicar un evento
  `SECURITY_ANALYSIS` en el canal del `EventBus` identificado por el mismo `threadId`
  que el cliente SSE usa para suscribirse.
- **RF-2**: El evento `SECURITY_ANALYSIS` DEBE contener los campos: `type`,
  `agent`, `threat_level`, `decision`, `reasoning`, `threadId`.
- **RF-3**: En caso de error interno del Sentinel, el nodo DEBE loguear via
  `SacredLogger.error` (NO `console.error`) y devolver un estado de `pass` conservador.
- **RF-4**: TODO el flujo de seguridad y entrega de eventos SSE DEBE estar validado mediante tests automatizados (Unit/Integration) para garantizar la integridad del perímetro.

## Escenarios de Prueba

### Escenario 1: Prompt limpio — evento llega al canal correcto
- **Given** un estado con `original_prompt: "creá una branch"` y `threadId` configurado
  como `"test-thread-123"`.
- **When** el `aduana_sentinel_node` ejecuta y evalúa el prompt como seguro.
- **Then** se debe haber publicado un evento en el canal `"test-thread-123"` del
  `EventBus`.
- **Y** el evento publicado debe tener `type: "SECURITY_ANALYSIS"` y
  `decision: "pass"`.

### Escenario 2: Prompt malicioso — evento de bloqueo llega al canal correcto
- **Given** un estado con `original_prompt` conteniendo un intento de jailbreak y
  `threadId: "test-thread-456"`.
- **When** el `aduana_sentinel_node` ejecuta y detecta `is_injection: true`.
- **Then** se debe publicar en el canal `"test-thread-456"` un evento con
  `decision: "block"` y `threat_level` distinto de `"none"`.

### Escenario 3: Error del LLM — log con SacredLogger
- **Given** que `LLMService.getStructuredData` lanza una excepción.
- **When** el `aduana_sentinel_node` captura el error en su bloque `catch`.
- **Then** `SacredLogger.error` debe haber sido invocado.
- **Y** `console.error` NO debe haber sido invocado.
