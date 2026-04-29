import { StateGraph, START, END } from "@langchain/langgraph";
import { SimpleRedisSaver } from "./checkpoints/SimpleRedisSaver.js";
import { getRedisConnection } from "@/db/redis.js";
import { AgentAnnotation } from "@/graph/state.js";
import { AgentStateType } from "@startup/shared";
import { ceo_node } from "@/nodes/ceo.js";
import { software_chief_node } from "@/nodes/chiefs/software_chief.js";
import { business_chief_node } from "@/nodes/chiefs/business_chief.js";
import { researcher_node } from "@/nodes/researcher.js";
import { git_worker_node } from "@/nodes/workers/git_worker_node.js";
import { test_runner_node } from "@/nodes/workers/test_runner_node.js";
import { ai_engine_worker_node } from "@/nodes/workers/ai_engine_worker_node.js";
import { persistence_node } from "@/nodes/workers/persistence_node.js";
import { code_researcher_node } from "@/nodes/workers/code_researcher_node.js";
// import { mirror_node } from "@/nodes/mirror.js"; // Removido por optimización de latencia
import { aduana_sentinel_node } from "@/nodes/mirror/aduana_sentinel_node.js";
import { circuit_breaker_node } from "@/nodes/circuit_breaker.js";
import { operations_chief_node } from "@/nodes/chiefs/operations_chief.js";
import { review_worker_node } from "@/nodes/workers/review_worker.js";
import { security_worker_node } from "@/nodes/workers/security_worker.js";
import { NodeName } from "@/types/index.js";

import { documentation_worker_node } from "@/nodes/workers/documentation_worker.js";
import { code_writer_node } from "@/nodes/workers/code_writer_node.js";
import { operations_worker_node } from "@/nodes/workers/operations_worker_node.js";
import { security_blocked_node } from "@/nodes/security_blocked.js";
import { TelemetryHelper } from "@/helpers/telemetryHelper.js";
import { AuditHelper } from "@/helpers/auditHelper.js";

/**
 * Combina múltiples wrappers (Telemetry, Auditing, etc.) en uno solo.
 */
function wrap(
    nodeName: string, 
    nodeFn: (state: AgentStateType, config?: unknown) => Promise<Partial<AgentStateType>> | Partial<AgentStateType>
) {
    return TelemetryHelper.wrapNode(nodeName, AuditHelper.wrapNode(nodeName, nodeFn));
}

/**
 * Orquestador Principal de la Startup Autónoma.
 * Usa SimpleRedisSaver para persistencia compatible.
 */
const workflow = new StateGraph(AgentAnnotation)
    .addNode("aduana_sentinel", wrap("aduana_sentinel", aduana_sentinel_node))
    .addNode("ceo", wrap("ceo", ceo_node))
    .addNode("circuit_breaker", wrap("circuit_breaker", circuit_breaker_node))
    .addNode("software_chief", wrap("software_chief", software_chief_node))
    .addNode("business_chief", wrap("business_chief", business_chief_node))
    .addNode("researcher", wrap("researcher", researcher_node))
    .addNode("git_worker", wrap("git_worker", git_worker_node))
    .addNode("test_runner", wrap("test_runner", test_runner_node))
    .addNode("ai_engine_worker", wrap("ai_engine_worker", ai_engine_worker_node))
    .addNode("persistence_worker", wrap("persistence_worker", persistence_node))
    .addNode("code_researcher", wrap("code_researcher", code_researcher_node))
    .addNode("operations_chief", wrap("operations_chief", operations_chief_node))
    .addNode("review_worker", wrap("review_worker", review_worker_node))
    .addNode("security_worker", wrap("security_worker", security_worker_node))
    .addNode("documentation_worker", wrap("documentation_worker", documentation_worker_node))
    .addNode("code_writer", wrap("code_writer", code_writer_node))
    .addNode("operations_worker", wrap("operations_worker", operations_worker_node))
    .addNode("security_blocked", wrap("security_blocked", security_blocked_node))

    .addEdge(START, "aduana_sentinel")
    .addConditionalEdges(
        "aduana_sentinel",
        (state: AgentStateType) => state.is_malicious ? "security_blocked" : "circuit_breaker",
        { security_blocked: "security_blocked", circuit_breaker: "circuit_breaker" }
    )
    // .addEdge("mirror", "circuit_breaker") // Removido
    .addEdge("circuit_breaker", "ceo");

workflow.addConditionalEdges(
    "circuit_breaker",
    (state: AgentStateType) => {
        if (state.max_budget_reached) return END;
        return (state.next_node as NodeName) || (state.active_chief as NodeName) || "ceo";
    }
);

workflow.addConditionalEdges(
    "ceo",
    (state: AgentStateType) => {
        if (!state.active_chief && (!state.plan || state.plan.length === 0)) return "end";
        if (state.active_chief || state.plan?.length > 0) return "circuit_breaker";
        return "end";
    },
    {
        circuit_breaker: "circuit_breaker",
        end: END
    }
);

workflow.addConditionalEdges("software_chief", (_state: AgentStateType) => "circuit_breaker", { circuit_breaker: "circuit_breaker" });
workflow.addConditionalEdges("business_chief", (_state: AgentStateType) => "circuit_breaker", { circuit_breaker: "circuit_breaker" });
workflow.addConditionalEdges("operations_chief", (state: AgentStateType) => {
    if (state.next_node === "operations_worker") return "operations_worker";
    return "circuit_breaker";
}, { 
    operations_worker: "operations_worker",
    circuit_breaker: "circuit_breaker" 
});

const workerReturnRouter = () => "circuit_breaker" as const;
const workerReturnMappings: Record<string, NodeName> = { circuit_breaker: "circuit_breaker" };

workflow.addConditionalEdges("researcher", workerReturnRouter);
workflow.addConditionalEdges("git_worker", workerReturnRouter);
workflow.addConditionalEdges("test_runner", workerReturnRouter);
workflow.addConditionalEdges("ai_engine_worker", workerReturnRouter);
workflow.addConditionalEdges("persistence_worker", workerReturnRouter);
workflow.addConditionalEdges("code_researcher", workerReturnRouter);
workflow.addConditionalEdges("review_worker", workerReturnRouter);
workflow.addConditionalEdges("security_worker", workerReturnRouter);
workflow.addConditionalEdges("documentation_worker", workerReturnRouter);
workflow.addConditionalEdges("code_writer", workerReturnRouter);
workflow.addConditionalEdges("operations_worker", workerReturnRouter);

// Checkpointer compatible con Redis estándar
const checkpointer = new SimpleRedisSaver(getRedisConnection());

/**
 * Exportación directa del grafo compilado.
 * Al usar SimpleRedisSaver, la inicialización es síncrona.
 */
export const graph = workflow.compile({ 
    checkpointer,
    interruptAfter: ["ceo", "operations_chief"],
    interruptBefore: ["git_worker"]
});

/**
 * Función helper para mantener la compatibilidad con el refactor previo si fuera necesario,
 * pero ahora simplemente retorna la constante.
 */
export const getGraph = async () => graph;
