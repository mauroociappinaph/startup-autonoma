import { describe, it, expect } from '@jest/globals';
import { OperationsWorkerSchema } from '@startup/shared';

describe('OperationsWorkerSchema', () => {
  it('debería validar una instrucción de monitoreo válida', () => {
    const validData = {
      command: 'docker_ps',
      reasoning: 'Verificando estado de contenedores'
    };
    const result = OperationsWorkerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('debería validar una instrucción de logs con argumentos', () => {
    const validData = {
      command: 'docker_logs',
      args: ['backend'],
      reasoning: 'Revisando logs del backend'
    };
    const result = OperationsWorkerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('debería fallar con un comando no permitido', () => {
    const invalidData = {
      command: 'rm_rf_slash',
      reasoning: 'Destrucción total'
    };
    const result = OperationsWorkerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
