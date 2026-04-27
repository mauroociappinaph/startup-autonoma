import { describe, it, expect } from '@jest/globals';
import { GraphFormatter } from '../helpers/graphFormatter.js';

describe('GraphFormatter', () => {
  const threadId = "test-thread";

  it('debería emitir un StreamEvent cuando se detecta is_malicious en el update', () => {
    const update = {
      aduana_sentinel: {
        is_malicious: true,
        security_report: "Amenaza detectada",
        messages: []
      }
    };

    const generator = GraphFormatter.formatUpdate(update, threadId);
    const events = Array.from(generator);

    expect(events.length).toBeGreaterThan(0);
    expect(events[0]).toMatchObject({
      agent: "ADUANA_SENTINEL",
      text: "Amenaza detectada"
    });
  });

  it('debería emitir un StreamEvent incluso si is_malicious es false pero hay reporte', () => {
    const update = {
      aduana_sentinel: {
        is_malicious: false,
        security_report: "Todo limpio",
        messages: []
      }
    };

    const generator = GraphFormatter.formatUpdate(update, threadId);
    const events = Array.from(generator);

    expect(events.length).toBeGreaterThan(0);
    expect(events[0].text).toBe("Todo limpio");
  });

  it('no debería emitir evento de seguridad si no hay campos correspondientes', () => {
    const update = {
      other_node: {
        some_data: "foo"
      }
    };

    const generator = GraphFormatter.formatUpdate(update, threadId);
    const events = Array.from(generator);

    expect(events.length).toBe(0);
  });
});
