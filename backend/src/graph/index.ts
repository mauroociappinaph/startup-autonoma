import { StateGraph, START, END, Command } from "@langchain/langgraph";
import { AgentAnnotation } from "./state.js";
import { ceo_node } from "../nodes/ceo.js";
import { researcher_node } from "../nodes/researcher.js";

/**
 * Orquestador Principal de la Startup. 
 * Ensambla el flujo de trabajo de los agentes usando LangGraph.
 */
export const createGraph = () => {
    // 1. Inicializar el Grafo con nuestra definición de estado
    const workflow = new StateGraph(AgentAnnotation)
        // 2. Registrar Nodos
        .addNode("ceo", ceo_node)
        .addNode("researcher", researcher_node)
        
        // 3. Definir el punto de entrada
        .addEdge(START, "ceo");

    // 4. Arista condicional: El CEO decide si delegar al Researcher
    workflow.addConditionalEdges(
        "ceo",
        (state) => {
            // Lógica de ruteo basada en el estado
            if (state.plan && state.plan.length > 0 && state.plan.includes("research")) {
                return "researcher";
            }
            return END;
        },
        {
            researcher: "researcher",
            __end__: END,
        }
    );

    // 5. Retorno del Worker al CEO
    workflow.addEdge("researcher", "ceo");

    // 6. Compilar el grafo
    return workflow.compile();
};

export const graph = createGraph();
