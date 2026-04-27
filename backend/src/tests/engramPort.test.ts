import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { SacredLogger } from '@/helpers/logger.js';

// Mocks globales
const mockCallTool = jest.fn();
const mockConnect = jest.fn();
const mockClose = jest.fn();

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { EngramPort } from '../mcp_ports/engramPort.js';

describe('EngramPort', () => {
  const mockArgs = {
    title: "Test Memory",
    type: "decision" as const,
    topic_key: "test/key",
    content: {
      What: "Test action",
      Why: "Validation"
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ENGRAM_MCP_URL = 'http://test-server:3001';
    
    // Espiamos SacredLogger
    jest.spyOn(SacredLogger, 'success').mockImplementation(() => {});
    jest.spyOn(SacredLogger, 'warn').mockImplementation(() => {});

    // Mockeamos los métodos en el prototipo de Client para que afecte a todas las instancias
    // Usamos cast a any para evitar conflictos de tipado con la inferencia estricta de Jest
    jest.spyOn(Client.prototype, 'connect').mockImplementation(mockConnect as any);
    jest.spyOn(Client.prototype, 'callTool').mockImplementation(mockCallTool as any);
    jest.spyOn(Client.prototype, 'close').mockImplementation(mockClose as any);

    // Default success implementations usando cast a any para evadir validaciones de tipo en los mocks
    (mockConnect as any).mockResolvedValue(undefined);
    (mockCallTool as any).mockResolvedValue({
      content: [{ type: 'text', text: 'mem-123' }]
    });
    (mockClose as any).mockResolvedValue(undefined);
  });

  it('RF-2.1: debería persistir memoria exitosamente cuando el servidor responde', async () => {
    const result = await EngramPort.save(mockArgs);

    expect(result.success).toBe(true);
    expect(result.id).toBe('mem-123');
    expect(mockCallTool).toHaveBeenCalledWith({
      name: "mem_save",
      arguments: expect.objectContaining({
        title: "Test Memory"
      })
    });
  });

  it('RF-2.2: debería manejar fallos de conexión de forma controlada', async () => {
    (mockConnect as any).mockRejectedValue(new Error("Connection failed"));

    const result = await EngramPort.save(mockArgs);

    expect(result.success).toBe(false);
    expect(result.message).toContain("Fallo de persistencia");
    expect(SacredLogger.warn).toHaveBeenCalledWith(expect.stringContaining("No se pudo persistir"), "ENGRAM_PORT");
  });

  it('RF-2.3: debería usar la URL por defecto si no hay variable de entorno', async () => {
    delete process.env.ENGRAM_MCP_URL;
    
    const result = await EngramPort.save(mockArgs);
    expect(result.success).toBe(true);
  });
});
