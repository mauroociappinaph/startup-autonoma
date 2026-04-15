import { StateGraph, START, END } from "@langchain/langgraph";
import { AgentAnnotation } from "@/graph/state.js";
import { AgentStateType } from "@/types/state.types.js";
import { ceo_node } from "@/nodes/ceo.js";
import { software_chief_node } from "@/nodes/chiefs/software_chief.js";
import { business_chief_node } from "@/nodes/chiefs/business_chief.js";
import { researcher_node } from "@/nodes/researcher.js";
import { git_worker_node } from "@/nodes/workers/git_worker_node.js";
import { test_runner_node } from "@/nodes/workers/test_runner_node.js";
import { ai_engine_worker_node } from "@/nodes/workers/ai_engine_worker_node.js";
import { mirror_node } from "@/nodes/mirror.js";

/**
 * Orquestador Principal de la Startup Autónoma. 
 * Jerarquía: Mirror (Aduana) -> CEO (Estrategia) -> Chiefs (Áreas) -> Workers (Ejecución).
 */
export const createGraph = () => {
    const workflow = new StateGraph(AgentAnnotation)
        .addNode("mirror", mirror_node)
        .addNode("ceo", ceo_node)
        .addNode("software_chief", software_chief_node)
        .addNode("business_chief", business_chief_node)
        .addNode("researcher", researcher_node)
        .addNode("git_worker", git_worker_node)
        .addNode("test_runner", test_runner_node)
        .addNode("ai_engine_worker", ai_engine_worker_node)

        // El flujo siempre arranca en el Mirror
        .addEdge(START, "mirror")
        .addEdge("mirror", "ceo");

    // Arista condicional del CEO: Decide a qué área (Chief) delegar
    workflow.addConditionalEdges(
        "ceo",
        (state: AgentStateType) => {
            if (!state.plan || state.plan.length === 0) {
                return "end";
            }
            
            if (state.plan.includes("software_chief")) {
                return "software_chief";
            }
            
            if (state.plan.includes("business_chief")) {
                return "business_chief";
            }

            return "end";
        },
        {
            software_chief: "software_chief",
            business_chief: "business_chief",
            end: END
        }
    );

    /**
     * Lógica de Delegación para los Chiefs
     */
    const chiefRouter = (state: AgentStateType) => {
        if (!state.plan || state.plan.length === 0) {
            return "ceo";
        }
        
        if (state.plan.includes("research")) return "researcher";
        if (state.plan.includes("git_operation")) return "git_worker";
        if (state.plan.includes("test_operation")) return "test_runner";
        if (state.plan.includes("ai_engine_task")) return "ai_engine_worker";

        return "ceo";
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chiefMappings: any = {
        researcher: "researcher",
        git_worker: "git_worker",
        test_runner: "test_runner",
        ai_engine_worker: "ai_engine_worker",
        ceo: "ceo"
    };

    // Aristas condicionales para ambos Chiefs
    workflow.addConditionalEdges("software_chief", chiefRouter, chiefMappings);
    workflow.addConditionalEdges("business_chief", chiefRouter, chiefMappings);

    /**
     * Retorno de los Workers al Chief que los invocó
     */
    const workerReturnRouter = (state: AgentStateType) => {
        return state.active_chief || "ceo";
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const workerReturnMappings: any = {
        software_chief: "software_chief",
        business_chief: "business_chief",
        ceo: "ceo"
    };

    workflow.addConditionalEdges("researcher", workerReturnRouter, workerReturnMappings);
    workflow.addConditionalEdges("git_worker", workerReturnRouter, workerReturnMappings);
    workflow.addConditionalEdges("test_runner", workerReturnRouter, workerReturnMappings);
    workflow.addConditionalEdges("ai_engine_worker", workerReturnRouter, workerReturnMappings);

    return workflow.compile();
};

export const graph = createGraph();
