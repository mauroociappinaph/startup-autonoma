import { StateGraph, START, END } from "@langchain/langgraph";
import { AgentAnnotation } from "@/graph/state.js";
import { mirror_node } from "@/nodes/mirror.js";
import { ceo_node } from "@/nodes/ceo.js";
import { software_chief_node } from "@/nodes/chiefs/software_chief.js";
import { researcher_node } from "@/nodes/researcher.js";
import { git_worker_node } from "@/nodes/workers/git_worker_node.js";
import { test_runner_node } from "@/nodes/workers/test_runner_node.js";

/**
 * Orquestador Principal de la Startup Autónoma. 
 * Jerarquía: Mirror (Introspección) -> CEO (Estrategia) -> Chiefs (Coordinación) -> Workers (Ejecución).
 */
export const createGraph = () => {
    const workflow = new StateGraph(AgentAnnotation)
        .addNode("mirror", mirror_node)
        .addNode("ceo", ceo_node)
        .addNode("software_chief", software_chief_node)
        .addNode("researcher", researcher_node)
        .addNode("git_worker", git_worker_node)
        .addNode("test_runner", test_runner_node)

        // El flujo siempre arranca en el Mirror para introspección y refinamiento
        .addEdge(START, "mirror")
        
        // Del Mirror saltamos al CEO (Nota: aquí es donde aplicaremos el interrupt_before)
        .addEdge("mirror", "ceo")

        // El CEO delega a los Chiefs
        .addEdge("ceo", "software_chief");

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

            if (state.plan.includes("test_operation")) {
                return "test_runner";
            }

            return END;
        },
        {
            researcher: "researcher",
            git_worker: "git_worker",
            test_runner: "test_runner",
            __end__: END,
        }
    );

    // Retorno de los Workers al Chief (para validación del resultado)
    workflow.addEdge("researcher", "software_chief");
    workflow.addEdge("git_worker", "software_chief");
    workflow.addEdge("test_runner", "software_chief");

    // El Chief vuelve al CEO para reporte final o nuevo hito
    workflow.addEdge("software_chief", "ceo");

    // El CEO puede decidir volver al Mirror si el usuario requiere cambios manuales
    // O finalizar el flujo si la visión se ha cumplido
    workflow.addEdge("ceo", END);

    return workflow.compile();
};

export const graph = createGraph();
