/**
 * Tipos para el streaming de eventos de LangGraph.
 */
export interface LangGraphStreamEvent {
  event: string;
  data: {
    chunk?: {
      content?: string | { content: string };
      tool_call_chunks?: { args?: string }[];
    };
    output?: Record<string, unknown>;
  };
  metadata?: {
    langgraph_node?: string;
    model_name?: string;
    [key: string]: unknown;
  };
  config?: {
    configurable?: {
      checkpoint_id?: string;
      [key: string]: unknown;
    };
  };
}
