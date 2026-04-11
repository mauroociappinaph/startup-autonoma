import { StateGraph, START, END } from "@langchain/langgraph";
import { AgentAnnotation } from "@/graph/state.js";
import { ceo_node } from "@/nodes/ceo.js";
import { software_chief_node } from "@/nodes/chiefs/software_chief.js";
import { researcher_node } from "@/nodes/researcher.js";

/**
 * Orquestador Principal de la Startup. 
 * Ensambla el flujo jerárquico: CEO -> SoftwareChief -> Worker.
 */
export const createGraph = () => {
    const workflow = new StateGraph(AgentAnnotation)
        .addNode("ceo", ceo_node)
        .addNode("software_chief", software_chief_node)
        .addNode("researcher", researcher_node)

        .addEdge(START, "ceo");

    // Arista: CEO delega al SoftwareChief
    workflow.addEdge("ceo", "software_chief");

    // Arista condicional: El Chief decide si delegar al Researcher
    workflow.addConditionalEdges(
        "software_chief",
        (state) => {
            if (state.plan && state.plan.includes("research")) {
                return "researcher";
            }
            return END;
        },
        {
            researcher: "researcher",
            __end__: END,
        }
    );

    // Retorno del Worker al Chief (para validación) y luego al CEO
    workflow.addEdge("researcher", "software_chief");
    workflow.addEdge("software_chief", "ceo");

    return workflow.compile();
};

export const graph = createGraph();

