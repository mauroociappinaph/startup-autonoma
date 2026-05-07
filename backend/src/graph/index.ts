import { StateGraph, START, END } from "@langchain/langgraph";
import { SimpleRedisSaver } from "./checkpoints/SimpleRedisSaver.js";
import { MsgpackSerializer } from "./serializers/MsgpackSerializer.js";
import { getRedisConnection } from "@/db/redis.js";
import { AgentAnnotation } from "@/graph/state.js";
import { AgentStateType } from "@startup/shared";
import { ceo_node } from "@/nodes/ceo.js";
import { aduana_sentinel_node } from "@/nodes/mirror/aduana_sentinel_node.js";
import { circuit_breaker_node } from "@/nodes/circuit_breaker.js";
import { security_blocked_node } from "@/nodes/security_blocked.js";
import { TelemetryHelper } from "@/helpers/telemetryHelper.js";
import { AuditHelper } from "@/helpers/auditHelper.js";

// Importar Sub-grafos de Dominio
import { software_domain_graph } from "./domains/software/index.js";
import { business_domain_graph } from "./domains/business/index.js";
import { operations_domain_graph } from "./domains/operations/index.js";

/**
 * Combina múltiples wrappers (Telemetry, Auditing, etc.) en uno solo.
 */
function wrap(
    nodeName: string, 
    nodeFn: any
) {
    return TelemetryHelper.wrapNode(nodeName, AuditHelper.wrapNode(nodeName, nodeFn));
}

/**
 * Orquestador Principal de la Startup Autónoma (V3 - Hierarchical).
 * El grafo principal ahora delega en sub-grafos de dominio.
 */
const workflow = new StateGraph(AgentAnnotation)
    .addNode("aduana_sentinel", wrap("aduana_sentinel", aduana_sentinel_node))
    .addNode("ceo", wrap("ceo", ceo_node))
    .addNode("circuit_breaker", wrap("circuit_breaker", circuit_breaker_node))
    .addNode("security_blocked", wrap("security_blocked", security_blocked_node))
    
    // Registrar Sub-grafos como Nodos
    .addNode("software_domain", software_domain_graph)
    .addNode("business_domain", business_domain_graph)
    .addNode("operations_domain", operations_domain_graph)

    .addEdge(START, "aduana_sentinel")
    .addConditionalEdges(
        "aduana_sentinel",
        (state: AgentStateType) => state.is_malicious ? "security_blocked" : "circuit_breaker",
        { security_blocked: "security_blocked", circuit_breaker: "circuit_breaker" }
    )
    .addEdge("circuit_breaker", "ceo");

// Ruteo Principal desde el Circuit Breaker
workflow.addConditionalEdges(
    "circuit_breaker",
    (state: AgentStateType) => {
        if (state.max_budget_reached) return "end";
        
        // El ruteo ahora es a nivel de DOMINIO
        if (state.active_chief === "software_chief") return "software_domain";
        if (state.active_chief === "business_chief") return "business_domain";
        if (state.active_chief === "operations_chief") return "operations_domain";
        
        return "ceo";
    },
    {
        end: END,
        ceo: "ceo",
        software_domain: "software_domain",
        business_domain: "business_domain",
        operations_domain: "operations_domain"
    }
);

// Ruteo de salida del CEO
workflow.addConditionalEdges(
    "ceo",
    (state: AgentStateType) => {
        if (!state.active_chief && (!state.plan || state.plan.length === 0)) return "end";
        return "circuit_breaker";
    },
    {
        circuit_breaker: "circuit_breaker",
        end: END
    }
);

// Los dominios siempre vuelven al Circuit Breaker para control global antes de ir al CEO o terminar
workflow.addEdge("software_domain", "circuit_breaker");
workflow.addEdge("business_domain", "circuit_breaker");
workflow.addEdge("operations_domain", "circuit_breaker");

// Checkpointer con serialización binaria (Msgpack)
const checkpointer = new SimpleRedisSaver(getRedisConnection(), new MsgpackSerializer());

export const graph = workflow.compile({ 
    checkpointer,
    interruptAfter: ["ceo"],
    interruptBefore: []
});

export const getGraph = async () => graph;
