import { StateGraph, START, END } from "@langchain/langgraph";
import { SimpleRedisSaver } from "./checkpoints/SimpleRedisSaver.js";
import { getRedisConnection } from "@/db/redis.js";
import { AgentAnnotation } from "@/graph/state.js";
import { AgentStateType } from "@/types/state.types.js";
import { ceo_node } from "@/nodes/ceo.js";
import { software_chief_node } from "@/nodes/chiefs/software_chief.js";
import { business_chief_node } from "@/nodes/chiefs/business_chief.js";
import { researcher_node } from "@/nodes/researcher.js";
import { git_worker_node } from "@/nodes/workers/git_worker_node.js";
import { test_runner_node } from "@/nodes/workers/test_runner_node.js";
import { ai_engine_worker_node } from "@/nodes/workers/ai_engine_worker_node.js";
import { persistence_node } from "@/nodes/workers/persistence_node.js";
import { code_researcher_node } from "@/nodes/workers/code_researcher_node.js";
import { mirror_node } from "@/nodes/mirror.js";
import { aduana_sentinel_node } from "@/nodes/mirror/aduana_sentinel_node.js";
import { circuit_breaker_node } from "@/nodes/circuit_breaker.js";
import { operations_chief_node } from "@/nodes/chiefs/operations_chief.js";
import { review_worker_node } from "@/nodes/workers/review_worker.js";
import { security_worker_node } from "@/nodes/workers/security_worker.js";
import { documentation_worker_node } from "@/nodes/workers/documentation_worker.js";
import { code_writer_node } from "@/nodes/workers/code_writer_node.js";

/**
 * Orquestador Principal de la Startup Autónoma.
 * Usa SimpleRedisSaver para persistencia compatible.
 */
const workflow = new StateGraph(AgentAnnotation)
    .addNode("aduana_sentinel", aduana_sentinel_node)
    .addNode("mirror", mirror_node)
    .addNode("ceo", ceo_node)
    .addNode("circuit_breaker", circuit_breaker_node)
    .addNode("software_chief", software_chief_node)
    .addNode("business_chief", business_chief_node)
    .addNode("researcher", researcher_node)
    .addNode("git_worker", git_worker_node)
    .addNode("test_runner", test_runner_node)
    .addNode("ai_engine_worker", ai_engine_worker_node)
    .addNode("persistence_worker", persistence_node)
    .addNode("code_researcher", code_researcher_node)
    .addNode("operations_chief", operations_chief_node)
    .addNode("review_worker", review_worker_node)
    .addNode("security_worker", security_worker_node)
    .addNode("documentation_worker", documentation_worker_node)
    .addNode("code_writer", code_writer_node)

    .addEdge(START, "aduana_sentinel")
    .addConditionalEdges(
        "aduana_sentinel",
        (state: AgentStateType) => state.is_malicious ? "ceo" : "mirror",
        { ceo: "ceo", mirror: "mirror" }
    )
    .addEdge("mirror", "circuit_breaker")
    .addEdge("circuit_breaker", "ceo");

workflow.addConditionalEdges(
    "circuit_breaker",
    (state: AgentStateType) => {
        if (state.max_budget_reached) return "end";
        return (state.next_node as NodeName) || "ceo";
    },
    {
        ceo: "ceo",
        software_chief: "software_chief",
        business_chief: "business_chief",
        researcher: "researcher",
        git_worker: "git_worker",
        test_runner: "test_runner",
        ai_engine_worker: "ai_engine_worker",
        persistence_worker: "persistence_worker",
        code_researcher: "code_researcher",
        operations_chief: "operations_chief",
        review_worker: "review_worker",
        security_worker: "security_worker",
        documentation_worker: "documentation_worker",
        code_writer: "code_writer",
        end: END
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any
);

workflow.addConditionalEdges(
    "ceo",
    (state: AgentStateType) => {
        if (!state.plan || state.plan.length === 0) return "end";
        if (state.plan.includes("software_chief")) return "circuit_breaker";
        if (state.plan.includes("business_chief")) return "circuit_breaker";
        return "end";
    },
    {
        circuit_breaker: "circuit_breaker",
        end: END
    }
);

type NodeName = "aduana_sentinel" | "software_chief" | "business_chief" | "operations_chief" | "test_runner" | "mirror" | "ceo" | "researcher" | "git_worker" | "ai_engine_worker" | "persistence_worker" | "code_researcher" | "review_worker" | "security_worker" | "documentation_worker" | "code_writer" | "circuit_breaker" | "__start__" | "__end__";

workflow.addConditionalEdges("software_chief", (_state: AgentStateType) => "circuit_breaker", { circuit_breaker: "circuit_breaker" });
workflow.addConditionalEdges("business_chief", (_state: AgentStateType) => "circuit_breaker", { circuit_breaker: "circuit_breaker" });
workflow.addConditionalEdges("operations_chief", (_state: AgentStateType) => "circuit_breaker", { circuit_breaker: "circuit_breaker" });

const workerReturnRouter = () => "circuit_breaker" as const;
const workerReturnMappings: Record<string, NodeName> = { circuit_breaker: "circuit_breaker" };

workflow.addConditionalEdges("researcher", workerReturnRouter, workerReturnMappings);
workflow.addConditionalEdges("git_worker", workerReturnRouter, workerReturnMappings);
workflow.addConditionalEdges("test_runner", workerReturnRouter, workerReturnMappings);
workflow.addConditionalEdges("ai_engine_worker", workerReturnRouter, workerReturnMappings);
workflow.addConditionalEdges("persistence_worker", workerReturnRouter, workerReturnMappings);
workflow.addConditionalEdges("code_researcher", workerReturnRouter, workerReturnMappings);
workflow.addConditionalEdges("review_worker", workerReturnRouter, workerReturnMappings);
workflow.addConditionalEdges("security_worker", workerReturnRouter, workerReturnMappings);
workflow.addConditionalEdges("documentation_worker", workerReturnRouter, workerReturnMappings);
workflow.addConditionalEdges("code_writer", workerReturnRouter, workerReturnMappings);

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
