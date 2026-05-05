# Delta for security/sse-event

## MODIFIED Requirements

### Requirement: SSE Security Streaming (#143)

The system MUST publish a `SECURITY_ANALYSIS` event to the `EventBus` when the `AduanaSentinel` evaluates a prompt. The event MUST contain `type`, `agent`, `threat_level`, `decision`, `reasoning`, and `threadId`. In case of error, it MUST log via `SacredLogger.error` and return a conservative `pass`. Automated tests MUST verify these behaviors.
(Previously: Lacked explicit requirement for automated verification via unit tests).

#### Scenario 1: Prompt limpio — evento llega al canal correcto
- GIVEN un estado con `original_prompt: "creá una branch"` y `threadId: "test-thread-123"`.
- WHEN el `aduana_sentinel_node` ejecuta y evalúa el prompt como seguro.
- THEN se debe haber publicado un evento en el canal `"test-thread-123"` del `EventBus` con `type: "SECURITY_ANALYSIS"` y `decision: "pass"`.

#### Scenario 2: Prompt malicioso — evento de bloqueo llega al canal correcto
- GIVEN un estado con `original_prompt` conteniendo un intento de jailbreak y `threadId: "test-thread-456"`.
- WHEN el `aduana_sentinel_node` ejecuta y detecta `is_injection: true`.
- THEN se debe publicar en el canal `"test-thread-456"` un evento con `decision: "block"` y `threat_level` distinto de `"none"`.

#### Scenario 3: Error del LLM — log con SacredLogger
- GIVEN que `LLMService.getStructuredData` lanza una excepción.
- WHEN el `aduana_sentinel_node` captura el error.
- THEN `SacredLogger.error` debe haber sido invocado y `console.error` NO.
