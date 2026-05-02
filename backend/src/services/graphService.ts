import { getGraph } from '@/graph/index.js';
import { AgentStateType } from '@startup/shared';
import { ProjectContext } from '@startup/shared';
import { EventBus } from './eventBus.js';
import { TelemetryService } from './telemetryService.js';
import { LLMService } from './llmService.js';
import { GraphFormatter } from '@/helpers/graphFormatter.js';
import { HumanMessage } from '@langchain/core/messages';
import { LangGraphStreamEvent } from '@/types/index.js';
import { TraceContext } from './traceContext.js';
import { StreamHelper } from '@/helpers/streamHelper.js';

/**
 * Servicio encargado de la orquestación y streaming del grafo.
 */
export class GraphService {
  /**
   * Ejecuta el grafo y devuelve un generador de eventos formateados, incluyendo tokens en tiempo real.
   */
  static async *runAgentStream(
    prompt: string, 
    threadId: string = "default-thread",
    projectContext?: ProjectContext
  ) {
    const graph = await getGraph();
    const initialInput: Partial<AgentStateType> = {
      project_context: projectContext,
      messages: [new HumanMessage(prompt)],
      trace_id: TraceContext.getTraceId() || threadId,
      plan: [],
      executive_summary: "",
      retry_count: 0,
    };

    const config = { configurable: { thread_id: threadId } };
    const eventStream = graph.streamEvents(initialInput, { ...config, version: "v2" });

    let reasoningBuffer = "";
    let lastYieldedLength = 0;
    let chunkCounter = 0;

    const currentState = await graph.getState(config);
    const baselineState = currentState.values as AgentStateType;

    for await (const rawEvent of eventStream) {
       const event = rawEvent as unknown as LangGraphStreamEvent;
       const eventType = event.event;
       
       if (eventType === "on_chat_model_stream") {
          const result = await StreamHelper.processReasoningStream(event, threadId, reasoningBuffer, lastYieldedLength);
          reasoningBuffer = result.buffer;
          lastYieldedLength = result.lastLength;

          chunkCounter++;
          if (chunkCounter % 10 === 0) {
            const estimatedTokens = Math.ceil(reasoningBuffer.length / 4);
            const currentNodeCost = LLMService.calculateCost(
              { prompt: 0, completion: estimatedTokens },
              event.metadata?.model_name || "default"
            );

            await EventBus.publish(threadId, {
              agent: "SYSTEM",
              type: "METRIC_PARTIAL",
              metadata: {
                estimated_tokens: (baselineState.token_usage?.total || 0) + estimatedTokens,
                estimated_cost: (baselineState.total_cost_usd || 0) + currentNodeCost,
                node: event.metadata?.langgraph_node
              },
              threadId
            });
          }
          
          if (result.yielded) yield { agent: event.metadata?.langgraph_node?.toUpperCase() || "SYSTEM", text: "", isPartial: true, threadId };
       }
       
       if (eventType === "on_node_start") {
          EventBus.publish(threadId, { agent: "SYSTEM", type: "SPAN_START", metadata: { node: event.metadata?.langgraph_node, trace_id: TraceContext.getTraceId() }, threadId });
          reasoningBuffer = "";
          lastYieldedLength = 0;
       }

       if (eventType === "on_node_end") {
         EventBus.publish(threadId, { agent: "SYSTEM", type: "SPAN_END", metadata: { node: event.metadata?.langgraph_node, trace_id: TraceContext.getTraceId() }, threadId });
         const updates = event.data.output as Record<string, unknown>;
         if (updates) {
            for (const update of GraphFormatter.formatUpdate(updates, threadId, event.config?.configurable?.checkpoint_id)) {
              await EventBus.publish(threadId, update);
              yield update;
            }
         }
       }
    }

    const state = await graph.getState(config);
    if (state.next.length > 0) {
      const waitEvent = {
        agent: "SYSTEM",
        text: "Estrategia generada. Esperando aprobación humana para proceder.",
        time: new Date().toLocaleTimeString(),
        activeNode: state.next[0],
        isWaiting: true,
        threadId
      };
      await EventBus.publish(threadId, waitEvent);
      yield waitEvent;
    }
  }

  /**
   * Reanuda la ejecución del grafo después de una interrupción (HITL).
   */
  static async *resumeAgent(threadId: string, status: 'approved' | 'rejected' = 'approved', feedback?: string) {
    const graph = await getGraph();
    const config = { configurable: { thread_id: threadId } };
    const stateValues = (await graph.getState(config)).values as AgentStateType;

    const projectContext = stateValues.project_context 
      ?? await (await import('./projectService.js')).projectService.getOrCreateProject('default-startup');

    if (status === 'approved') {
      await graph.updateState(config, { is_mission_approved: true, project_context: projectContext });
    } else if (status === 'rejected' && feedback) {
      await graph.updateState(config, { 
        is_mission_approved: false,
        project_context: projectContext,
        messages: [new HumanMessage(`[HUMAN_FEEDBACK]: ${feedback}`)],
        active_chief: null,
        next_node: null
      });
    }

    let isWaiting = false;
    let nextNode = "";
    let reasoningBuffer = "";
    let lastYieldedLength = 0;

    do {
      const eventStream = graph.streamEvents(null, { ...config, version: "v2" });
      
      for await (const rawEvent of eventStream) {
        const event = rawEvent as unknown as LangGraphStreamEvent;
        const eventType = event.event;
        
        if (eventType === "on_chat_model_stream") {
          const result = await StreamHelper.processReasoningStream(event, threadId, reasoningBuffer, lastYieldedLength);
          reasoningBuffer = result.buffer;
          lastYieldedLength = result.lastLength;
          if (result.yielded) yield { agent: event.metadata?.langgraph_node?.toUpperCase() || "SYSTEM", text: "", isPartial: true, threadId };
        }

        if (eventType === "on_node_start") {
          reasoningBuffer = "";
          lastYieldedLength = 0;
        }

        if (eventType === "on_node_end") {
          EventBus.publish(threadId, { agent: "SYSTEM", type: "SPAN_END", metadata: { node: event.metadata?.langgraph_node, trace_id: TraceContext.getTraceId() }, threadId });
          const updates = event.data.output as Record<string, unknown>;
          if (updates) { 
            for (const update of GraphFormatter.formatUpdate(updates, threadId, event.config?.configurable?.checkpoint_id)) {
              await EventBus.publish(threadId, update);
              yield update;
            }
          }
        }
      }

      const state = await graph.getState(config);
      isWaiting = state.next && state.next.length > 0;
      nextNode = state.next[0] || "";

      if (isWaiting && (nextNode === "ceo" || nextNode === "circuit_breaker")) continue;
      else break;
    } while (true);

    if (isWaiting) {
      const waitEv = {
        agent: "SYSTEM",
        text: "Misión pausada. Esperando nueva instrucción o confirmación.",
        time: new Date().toLocaleTimeString(),
        activeNode: nextNode,
        isWaiting: true,
        threadId
      };
      await EventBus.publish(threadId, waitEv);
      yield waitEv;
    }
  }

  static async getHistory(threadId: string) {
    const graph = await getGraph();
    const config = { configurable: { thread_id: threadId } };
    const history = [];
    for await (const state of graph.getStateHistory(config)) {
      history.push({ id: state.config.configurable?.checkpoint_id, next: state.next, values: state.values, createdAt: (state.metadata as { step?: number })?.step });
    }
    return history;
  }

  static async rewind(threadId: string, checkpointId: string) {
    const graph = await getGraph();
    const config = { configurable: { thread_id: threadId, checkpoint_id: checkpointId } };
    const state = await graph.getState(config);
    if (!state) throw new Error("Checkpoint no encontrado");
    await graph.updateState({ configurable: { thread_id: threadId } }, state.values);
    return { success: true, checkpointId };
  }
}
