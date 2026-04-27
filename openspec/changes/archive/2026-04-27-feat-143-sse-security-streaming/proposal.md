# Propuesta: Fix SSE Security Streaming (#143)

## Intención
Corregir el bug por el cual los eventos `SECURITY_ANALYSIS` generados por el nodo
`AduanaSentinel` **nunca llegan al cliente** del stream SSE, a pesar de que el código
de publicación ya existe.

## Motivación
El nodo `aduana_sentinel_node` publica eventos en el `EventBus` usando
`state.trace_id` como identificador de canal. Sin embargo, el cliente SSE se suscribe
usando el `threadId` (o `sessionId`) generado por el `AgentController`. Si estos dos
valores no coinciden — que en la práctica NUNCA coinciden — el evento se pierde en un
canal fantasma que nadie escucha.

Adicionalmente, el `catch` del Sentinel usa `console.error` en vez de `SacredLogger`,
violando la Ley #14 que acabamos de establecer en la issue #150.

## Alcance
- Arreglar el `threadId` en el evento de seguridad del Sentinel para que use el
  identificador correcto del grafo.
- Migrar el `console.error` del catch a `SacredLogger.error`.
- Agregar un test unitario que verifique que el evento `SECURITY_ANALYSIS` se publica
  en el canal correcto.

## Capacidades
- `security/sse-event`: El nodo Aduana Sentinel emite un evento `SECURITY_ANALYSIS`
  observable por el cliente SSE conectado al mismo `threadId`.
