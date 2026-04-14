import { StateGraph, START, END } from "@langchain/langgraph";
import { AgentAnnotation } from "@/graph/state.js";
import { ceo_node } from "@/nodes/ceo.js";
import { software_chief_node } from "@/nodes/chiefs/software_chief.js";
import { researcher_node } from "@/nodes/researcher.js";
import { git_worker_node } from "@/nodes/workers/git_worker_node.js";

/**
 * Orquestador Principal de la Startup. 
 * Ensambla el flujo jerárquico: CEO -> SoftwareChief -> Workers.
 */
export const createGraph = () => {
    const workflow = new StateGraph(AgentAnnotation)
        .addNode("ceo", ceo_node)
        .addNode("software_chief", software_chief_node)
        .addNode("researcher", researcher_node)
        .addNode("git_worker", git_worker_node)

        .addEdge(START, "ceo");

    // Arista: CEO delega al SoftwareChief
    workflow.addEdge("ceo", "software_chief");

    // Arista condicional: El Chief decide a qué Worker delegar
    workflow.addConditionalEdges(
        "software_chief",
        (state) => {
            if (!state.plan || state.plan.length === 0) {
                return END;
            }
            
            if (state.plan.includes("research")) {
                return "researcher";
            }
            
            if (state.plan.includes("git_operation")) {
                return "git_worker";
            }

            return END;
        },
        {
            researcher: "researcher",
            git_worker: "git_worker",
            __end__: END,
        }
    );

    // Retorno de los Workers al Chief (para validación del resultado)
    workflow.addEdge("researcher", "software_chief");
    workflow.addEdge("git_worker", "software_chief");

    // El Chief puede volver al CEO cuando termina su misión o necesita reporte
    workflow.addEdge("software_chief", "ceo");

    return workflow.compile();
};

export const graph = createGraph();
