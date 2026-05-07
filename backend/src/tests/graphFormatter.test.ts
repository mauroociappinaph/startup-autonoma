import { describe, it, expect } from '@jest/globals';
import { GraphFormatter } from '../helpers/graphFormatter.js';

describe('GraphFormatter', () => {
  const threadId = "test-thread-123";
  const checkpointId = "cp-456";

  it('debería generar un evento de nodo estándar cuando hay mensajes', () => {
    const update = {
      "software_chief": {
        messages: [{ content: "[SOFTWARE_CHIEF] Trabajando en el código" }],
        plan: "Plan maestro",
        executive_summary: "Todo bien"
      }
    };

    const generator = GraphFormatter.formatUpdate(update as any, threadId, checkpointId);
    const events = Array.from(generator);

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      agent: "SOFTWARE_CHIEF",
      text: "[SOFTWARE_CHIEF] Trabajando en el código",
      activeNode: "software_chief",
      threadId,
      checkpointId
    });
  });

  it('debería generar un evento de seguridad cuando is_malicious está presente', () => {
    const update = {
      "mirror": {
        is_malicious: true,
        security_report: "Intento de jailbreak detectado",
        messages: [] // Sin mensajes para aislar el caso de seguridad
      }
    };

    const generator = GraphFormatter.formatUpdate(update as any, threadId, checkpointId);
    const events = Array.from(generator);

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      agent: "ADUANA_SENTINEL",
      text: "Intento de jailbreak detectado",
      activeNode: "mirror",
      threadId
    });
  });

  it('debería generar ambos eventos si hay mensajes y reporte de seguridad', () => {
    const update = {
      "mirror": {
        messages: [{ content: "[MIRROR] Analizando..." }],
        is_malicious: false,
        security_report: "Todo limpio"
      }
    };

    const generator = GraphFormatter.formatUpdate(update as any, threadId, checkpointId);
    const events = Array.from(generator);

    expect(events).toHaveLength(2);
    expect(events[0].agent).toBe("MIRROR");
    expect(events[0].text).toBe("[MIRROR] Analizando...");
    expect(events[1].agent).toBe("ADUANA_SENTINEL");
    expect(events[1].text).toBe("Todo limpio");
  });

  it('debería manejar mensajes con contenido no string (JSON)', () => {
    const update = {
      "ceo": {
        messages: [{ content: { type: "thought", text: "[CEO] Pensando..." } }]
      }
    };

    const generator = GraphFormatter.formatUpdate(update as any, threadId, checkpointId);
    const events = Array.from(generator);

    expect(events).toHaveLength(1);
    expect(events[0].agent).toBe("CEO");
    expect(events[0].text).toContain("[CEO] Pensando...");
  });
});
