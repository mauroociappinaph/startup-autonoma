// @ts-nocheck
import { Request, Response } from 'express';
import { jest } from '@jest/globals';

// Mocks de módulos ESM (deben ir antes de cualquier import que los use)
jest.unstable_mockModule('../db/redis.js', () => ({
  getRedisConnection: jest.fn(() => ({
    ping: jest.fn().mockResolvedValue('PONG')
  })),
  getRedisSubscriber: jest.fn(() => ({
    subscribe: jest.fn().mockResolvedValue(undefined),
    on: jest.fn()
  })),
  closeRedisConnections: jest.fn().mockResolvedValue(undefined)
}));

jest.unstable_mockModule('../services/aiEngineClient.js', () => ({
  aiEngineClient: {
    ping: jest.fn().mockResolvedValue(true)
  }
}));

// Importar dinámicamente el controlador después de los mocks
const { SystemController } = await import('../controllers/systemController.js');
const { getRedisConnection } = await import('../db/redis.js');
const { aiEngineClient } = await import('../services/aiEngineClient.js');

describe('SystemController: HealthCheck', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockRequest = {};
    mockResponse = {
      json: jsonMock,
      status: statusMock,
    };
    jest.clearAllMocks();
  });

  it('debe devolver 200 si Redis y AI Engine están saludables', async () => {
    (getRedisConnection as any).mockReturnValue({
      ping: jest.fn().mockResolvedValue('PONG' as any),
    });
    (aiEngineClient.ping as any).mockResolvedValue(true);

    await SystemController.healthCheck(mockRequest as Request, mockResponse as Response);

    expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
      services: { redis: true, ai_engine: true }
    }));
  });

  it('debe devolver 503 si Redis falla', async () => {
    (getRedisConnection as any).mockReturnValue({
      ping: jest.fn().mockResolvedValue('FAIL' as any),
    });
    (aiEngineClient.ping as any).mockResolvedValue(true);

    await SystemController.healthCheck(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(503);
    expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
      status: 'Degraded / Unhealthy',
      services: { redis: false, ai_engine: true }
    }));
  });

  it('debe devolver 503 si AI Engine falla', async () => {
    (getRedisConnection as any).mockReturnValue({
      ping: jest.fn().mockResolvedValue('PONG' as any),
    });
    (aiEngineClient.ping as any).mockResolvedValue(false);

    await SystemController.healthCheck(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(503);
    expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
      services: { redis: true, ai_engine: false }
    }));
  });
});
