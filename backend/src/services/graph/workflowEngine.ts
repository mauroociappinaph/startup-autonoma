import { getGraph } from '@/graph/index.js';
import { AgentStateType, ProjectContext } from '@startup/shared';
import { HumanMessage } from '@langchain/core/messages';
import { TraceContext } from '../traceContext.js';
import { LangGraphStreamEvent } from '@/types/index.js';
import { StreamHelper } from '@/helpers/streamHelper.js';
import { services } from '../index.js';
import { GraphFormatter } from '@/helpers/graphFormatter.js';

/**
 * Motor de ejecución y streaming para LangGraph.
 */
export class WorkflowEngine {
  /**
   * Ejecuta el flujo inicial del agente.
   */
  public static async *run(prompt: string, threadId: string, projectContext?: ProjectContext) {
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

    yield* this._processStream(eventStream, threadId, graph, config);
  }

  /**
   * Reanuda un flujo pausado (HITL).
   */
  public static async *resume(threadId: string, status: 'approved' | 'rejected', feedback?: string) {
    const graph = await getGraph();
    const config = { configurable: { thread_id: threadId } };
    const stateValues = (await graph.getState(config)).values as AgentStateType;

    if (status === 'approved') {
      await graph.updateState(config, { is_mission_approved: true });
    } else if (status === 'rejected' && feedback) {
      await graph.updateState(config, { 
        is_mission_approved: false,
        messages: [new HumanMessage(`[HUMAN_FEEDBACK]: ${feedback}`)],
        active_chief: null,
        next_node: null
      });
    }

    let isWaiting = false;
    let nextNode = "";

    do {
      const eventStream = graph.streamEvents(null, { ...config, version: "v2" });
      yield* this._processStream(eventStream, threadId, graph, config);

      const state = await graph.getState(config);
      isWaiting = state.next && state.next.length > 0;
      nextNode = state.next[0] || "";

      if (isWaiting && (nextNode === "ceo" || nextNode === "circuit_breaker")) continue;
      else break;
    } while (true);

    if (isWaiting) {
      yield* this._yieldWaitMessage(threadId, nextNode);
    }
  }

  /**
   * Lógica compartida para procesar el stream de eventos.
   */
  private static async *_processStream(eventStream: any, threadId: string, graph: any, config: any) {
    let reasoningBuffer = "";
    let lastYieldedLength = 0;
    let chunkCounter = 0;

    const currentState = await graph.getState(config);
    const baselineState = currentState.values as AgentStateType;

    for await (const rawEvent of eventStream) {
       const event = rawEvent as unknown as LangGraphStreamEvent;
       
       if (event.event === "on_chat_model_stream") {
          const result = await StreamHelper.processReasoningStream(event, threadId, reasoningBuffer, lastYieldedLength);
          reasoningBuffer = result.buffer;
          lastYieldedLength = result.lastLength;

          if (++chunkCounter % 10 === 0) {
            await this._publishMetrics(threadId, reasoningBuffer, baselineState, event);
          }
          if (result.yielded) yield { agent: event.metadata?.langgraph_node?.toUpperCase() || "SYSTEM", text: "", isPartial: true, threadId };
       }
       
       if (event.event === "on_node_start") {
          services.eventBus.publish(threadId, { agent: "SYSTEM", type: "SPAN_START", metadata: { node: event.metadata?.langgraph_node }, threadId });
          reasoningBuffer = "";
          lastYieldedLength = 0;
       }

       if (event.event === "on_node_end") {
         services.eventBus.publish(threadId, { agent: "SYSTEM", type: "SPAN_END", metadata: { node: event.metadata?.langgraph_node }, threadId });
         const updates = event.data.output as Record<string, unknown>;
         if (updates) {
            for (const update of GraphFormatter.formatUpdate(updates, threadId, event.config?.configurable?.checkpoint_id)) {
              await services.eventBus.publish(threadId, update);
              yield update;
            }
         }
       }
    }
  }

  private static async _publishMetrics(threadId: string, buffer: string, baseline: AgentStateType, event: any) {
    const tokens = Math.ceil(buffer.length / 4);
    const cost = services.llm.calculateCost({ prompt: 0, completion: tokens }, event.metadata?.model_name || "default");
    await services.eventBus.publish(threadId, {
      agent: "SYSTEM",
      type: "METRIC_PARTIAL",
      metadata: {
        estimated_tokens: (baseline.token_usage?.total || 0) + tokens,
        estimated_cost: (baseline.total_cost_usd || 0) + cost,
        node: event.metadata?.langgraph_node
      },
      threadId
    });
  }

  private static async *_yieldWaitMessage(threadId: string, nextNode: string) {
    const waitEvent = {
      agent: "SYSTEM",
      text: "Misión pausada. Esperando aprobación humana.",
      time: new Date().toLocaleTimeString(),
      activeNode: nextNode,
      isWaiting: true,
      threadId
    };
    await services.eventBus.publish(threadId, waitEvent);
    yield waitEvent;
  }
}
