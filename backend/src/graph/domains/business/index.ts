import { StateGraph, START, END } from "@langchain/langgraph";
import { AgentAnnotation } from "@/graph/state.js";
import { AgentStateType } from "@startup/shared";
import { business_chief_node } from "@/nodes/chiefs/business_chief.js";
import { researcher_node } from "@/nodes/researcher.js";
import { ai_engine_worker_node } from "@/nodes/workers/ai_engine_worker_node.js";
import { persistence_node } from "@/nodes/workers/persistence_node.js";
import { TelemetryHelper } from "@/helpers/telemetryHelper.js";
import { AuditHelper } from "@/helpers/auditHelper.js";

function wrap(nodeName: string, nodeFn: any) {
    return TelemetryHelper.wrapNode(nodeName, AuditHelper.wrapNode(nodeName, nodeFn));
}

/**
 * Sub-grafo del Dominio de Negocios (Business).
 * Maneja lead gen, mercado y persistencia comercial.
 */
const businessWorkflow = new StateGraph(AgentAnnotation)
    .addNode("business_chief", wrap("business_chief", business_chief_node))
    .addNode("researcher", wrap("researcher", researcher_node))
    .addNode("ai_engine_worker", wrap("ai_engine_worker", ai_engine_worker_node))
    .addNode("persistence_worker", wrap("persistence_worker", persistence_node))

    .addEdge(START, "business_chief")

    .addConditionalEdges(
        "business_chief",
        (state: AgentStateType) => {
            if (!state.next_node || state.next_node === "ceo" || state.next_node === "end") return "end";
            return state.next_node;
        },
        {
            researcher: "researcher",
            ai_engine_worker: "ai_engine_worker",
            persistence_worker: "persistence_worker",
            end: END
        }
    );

businessWorkflow.addEdge("researcher", "business_chief");
businessWorkflow.addEdge("ai_engine_worker", "business_chief");
businessWorkflow.addEdge("persistence_worker", "business_chief");

export const business_domain_graph = businessWorkflow.compile();
