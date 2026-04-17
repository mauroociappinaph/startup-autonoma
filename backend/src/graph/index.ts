import { StateGraph, START, END, MemorySaver } from "@langchain/langgraph";
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
import { circuit_breaker_node } from "@/nodes/circuit_breaker.js";

/**
 * Orquestador Principal de la Startup Autónoma. 
 * Jerarquía: Mirror (Aduana) -> Circuit Breaker (Seguridad) -> CEO (Estrategia) -> Chiefs (Áreas) -> Workers (Ejecución).
 */
export const createGraph = () => {
    const workflow = new StateGraph(AgentAnnotation)
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

        // El flujo siempre arranca en el Mirror
        .addEdge(START, "mirror")
        .addEdge("mirror", "circuit_breaker")
        .addEdge("circuit_breaker", "ceo");

    // Aristas condicionales para el Circuit Breaker (El Guardián)
    workflow.addConditionalEdges(
        "circuit_breaker",
        (state: AgentStateType) => {
            if (state.max_budget_reached) return "end";
            // Si no hay next_node definido, vamos al CEO por defecto si hay plan
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
            end: END
        }
    );

    // Arista condicional del CEO: Decide a qué área (Chief) delegar
    workflow.addConditionalEdges(
        "ceo",
        (state: AgentStateType) => {
            if (!state.plan || state.plan.length === 0) {
                return "end";
            }
            
            if (state.plan.includes("software_chief")) {
                return "circuit_breaker"; // Vamos al guardian antes del jefe
            }
            
            if (state.plan.includes("business_chief")) {
                return "circuit_breaker";
            }

            return "end";
        },
        {
            circuit_breaker: "circuit_breaker",
            end: END
        }
    );

    /**
     * Lógica de Delegación para los Chiefs
     */
    // Eliminamos chiefRouter no utilizado para limpiar logs de lint

    // Tipado estricto para los mappings de LangGraph (Ley #3)
    type NodeName = "software_chief" | "business_chief" | "test_runner" | "mirror" | "ceo" | "researcher" | "git_worker" | "ai_engine_worker" | "persistence_worker" | "code_researcher" | "circuit_breaker" | "__start__" | "__end__";
    
    // Aristas condicionales para ambos Chiefs
    workflow.addConditionalEdges("software_chief", (state: AgentStateType) => {
        // Antes de ir al worker, validamos el plan para asegurar trazabilidad si fuera necesaria
        if (state.plan?.includes("research")) { /* tracking futuro */ }
        
        // Devolvemos circuit_breaker para validación de seguridad centralizada
        return "circuit_breaker";
    }, { circuit_breaker: "circuit_breaker" });

    workflow.addConditionalEdges("business_chief", (_state: AgentStateType) => {
        return "circuit_breaker";
    }, { circuit_breaker: "circuit_breaker" });

    /**
     * Retorno de los Workers al Chief que los invocó
     */
    const workerReturnRouter = (_state: AgentStateType) => {
        return "circuit_breaker" as const;
    };

    const workerReturnMappings: Record<string, NodeName> = {
        circuit_breaker: "circuit_breaker"
    };

    workflow.addConditionalEdges("researcher", workerReturnRouter, workerReturnMappings);
    workflow.addConditionalEdges("git_worker", workerReturnRouter, workerReturnMappings);
    workflow.addConditionalEdges("test_runner", workerReturnRouter, workerReturnMappings);
    workflow.addConditionalEdges("ai_engine_worker", workerReturnRouter, workerReturnMappings);
    workflow.addConditionalEdges("persistence_worker", workerReturnRouter, workerReturnMappings);
    workflow.addConditionalEdges("code_researcher", workerReturnRouter, workerReturnMappings);

    // Inicializamos el checkpointer para control de HITL y persistencia
    const checkpointer = new MemorySaver();

    // Compilamos con interrupción selectiva (HITL v2)
    return workflow.compile({ 
        checkpointer,
        // Eliminamos interruptAfter estático para manejarlo programáticamente o via nodos intermedios si fuera necesario
        // Por ahora, lo mantenemos pero mejoramos la lógica del Mirror/CEO
        interruptAfter: ["ceo"] 
    });
};

export const graph = createGraph();
