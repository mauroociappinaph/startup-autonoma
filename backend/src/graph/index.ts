import { StateGraph, START, END } from "@langchain/langgraph";
import { AgentAnnotation } from "./state.js";
import { AgentStateType } from "../types/state.js";
import { ceo_node } from "../nodes/ceo.js";

/**
 * Orquestador Principal de la Startup. 
 * Ensambla el flujo de trabajo de los agentes usando LangGraph.
 */
export const createGraph = () => {
    // 1. Inicializar el Grafo con nuestra definición de estado (Annotation)
    const workflow = new StateGraph(AgentAnnotation)
        // 2. Registrar el Nodo CEO
        .addNode("ceo", ceo_node)
        
        // 3. Definir el punto de entrada
        .addEdge(START, "ceo")
        
        // 4. Por ahora, terminamos en el CEO (hasta que tengamos más Workers)
        .addEdge("ceo", END);

    // 5. Compilar el grafo con persistencia (memoria local por ahora)
    return workflow.compile();
};

// Exportamos el grafo listo para ser ejecutado por el servidor
export const graph = createGraph();
