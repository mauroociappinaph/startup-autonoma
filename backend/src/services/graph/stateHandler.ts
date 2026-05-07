import { getGraph } from '@/graph/index.js';
import { AgentStateType } from '@startup/shared';

/**
 * Gestiona el historial, checkpoints y rebobinado (rewind) del grafo.
 */
export class StateHandler {
  /**
   * Recupera el historial completo de estados de un hilo.
   */
  public static async getHistory(threadId: string) {
    const graph = await getGraph();
    const config = { configurable: { thread_id: threadId } };
    const history = [];
    
    for await (const state of graph.getStateHistory(config)) {
      history.push({ 
        id: state.config.configurable?.checkpoint_id, 
        next: state.next, 
        values: state.values, 
        createdAt: (state.metadata as { step?: number })?.step 
      });
    }
    return history;
  }

  /**
   * Rebobina el estado a un checkpoint específico.
   */
  public static async rewind(threadId: string, checkpointId: string) {
    const graph = await getGraph();
    const config = { configurable: { thread_id: threadId, checkpoint_id: checkpointId } };
    
    const state = await graph.getState(config);
    if (!state) throw new Error("Checkpoint no encontrado");
    
    await graph.updateState({ configurable: { thread_id: threadId } }, state.values);
    return { success: true, checkpointId };
  }

  /**
   * Recupera el valor actual de una clave del estado.
   */
  public static async getCurrentState(threadId: string): Promise<AgentStateType> {
    const graph = await getGraph();
    const config = { configurable: { thread_id: threadId } };
    const state = await graph.getState(config);
    return state.values as AgentStateType;
  }
}
