/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from '@jest/globals';
import { safeExec } from './operationsHelper.js';

describe('safeExec', () => {
  it('debería retornar el comando docker ps para docker_ps', () => {
    const result = safeExec('docker_ps');
    expect(result).toBe('docker ps --format "{{.Names}}: {{.Status}}"');
  });

  it('debería retornar logs con argumentos para docker_logs', () => {
    const result = safeExec('docker_logs', ['backend']);
    expect(result).toBe('docker logs backend --tail 50');
  });

  it('debería retornar npm run build para npm_build', () => {
    const result = safeExec('npm_build');
    expect(result).toBe('npm run build');
  });

  it('debería retornar el health check para check_health', () => {
    const result = safeExec('check_health');
    expect(result).toContain('curl -s http://localhost:3000/health');
  });

  it('debería fallar para comandos no permitidos', () => {
    expect(() => safeExec('rm_rf' as any)).toThrow('Comando no permitido');
  });
});
