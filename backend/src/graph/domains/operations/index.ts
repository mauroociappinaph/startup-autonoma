import { StateGraph, START, END } from "@langchain/langgraph";
import { AgentAnnotation } from "@/graph/state.js";
import { AgentStateType } from "@startup/shared";
import { operations_chief_node } from "@/nodes/chiefs/operations_chief.js";
import { operations_worker_node } from "@/nodes/workers/operations_worker_node.js";
import { security_worker_node } from "@/nodes/workers/security_worker.js";
import { TelemetryHelper } from "@/helpers/telemetryHelper.js";
import { AuditHelper } from "@/helpers/auditHelper.js";

function wrap(nodeName: string, nodeFn: any) {
    return TelemetryHelper.wrapNode(nodeName, AuditHelper.wrapNode(nodeName, nodeFn));
}

/**
 * Sub-grafo del Dominio de Operaciones.
 * Enfocado en infraestructura, seguridad y mantenimiento.
 */
const operationsWorkflow = new StateGraph(AgentAnnotation)
    .addNode("operations_chief", wrap("operations_chief", operations_chief_node))
    .addNode("operations_worker", wrap("operations_worker", operations_worker_node))
    .addNode("security_worker", wrap("security_worker", security_worker_node))

    .addEdge(START, "operations_chief")

    .addConditionalEdges(
        "operations_chief",
        (state: AgentStateType) => {
            if (!state.next_node || state.next_node === "ceo" || state.next_node === "end") return "end";
            return state.next_node;
        },
        {
            operations_worker: "operations_worker",
            security_worker: "security_worker",
            end: END
        }
    );

operationsWorkflow.addEdge("operations_worker", "operations_chief");
operationsWorkflow.addEdge("security_worker", "operations_chief");

export const operations_domain_graph = operationsWorkflow.compile();
