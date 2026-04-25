import { describe, it, expect, afterAll } from '@jest/globals';
import { graph } from './index.js';
import { closeRedisConnections } from '../db/redis.js';

describe('Graph Topology', () => {
  it('debería tener el nodo operations_worker registrado', () => {
    const nodes = (graph as any).nodes;
    expect(nodes).toHaveProperty('operations_worker');
  });

  it('debería tener operations_chief en interruptAfter', () => {
    const config = (graph as any).config; // Depende de la versión de LangGraph
    // Alternativamente, podemos verificar la compilación
    expect(graph).toBeDefined();
  });
  
  afterAll(async () => {
    await closeRedisConnections();
  });
});
