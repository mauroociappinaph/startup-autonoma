import { StateGraph, START, END } from "@langchain/langgraph";
import { AgentAnnotation } from "@/graph/state.js";
import { ceo_node } from "@/nodes/ceo.js";
import { software_chief_node } from "@/nodes/chiefs/software_chief.js";
import { researcher_node } from "@/nodes/researcher.js";
import { git_worker_node } from "@/nodes/workers/git_worker_node.js";
import { test_runner_node } from "@/nodes/workers/test_runner_node.js";
import { mirror_node } from "@/nodes/mirror.js"; // Importamos el mirror node

/**
 * Orquestador Principal de la Startup Autónoma. 
 * Jerarquía: Mirror (Introspección) -> CEO (Estrategia) -> Chiefs (Coordinación) -> Workers (Ejecución).
 */
export const createGraph = () => {
    const workflow = new StateGraph(AgentAnnotation)
        .addNode("mirror", mirror_node) // Añadimos el nodo Mirror como primer paso
        .addNode("ceo", ceo_node)
        .addNode("software_chief", software_chief_node)
        .addNode("researcher", researcher_node)
        .addNode("git_worker", git_worker_node)
        .addNode("test_runner", test_runner_node)

        // El flujo siempre arranca en el Mirror para introspección y refinamiento
        .addEdge(START, "mirror");
        
    // Arista: Mirror refina y pasa al CEO
    workflow.addEdge("mirror", "ceo");

    // Arista: CEO delega al SoftwareChief (o BusinessChief en el futuro)
    workflow.addEdge("ceo", "software_chief");

    // Arista condicional: El Chief decide a qué Worker delegar o finalizar
    workflow.addConditionalEdges(
        "software_chief",
        (state) => {
            // Si no hay plan o está vacío, el Chief termina la tarea para él
            if (!state.plan || state.plan.length === 0) {
                // Si el Chief termina y no hay más tareas, vuelve al CEO para consolidar
                return "ceo"; 
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

            if (state.plan.includes("ai_engine_task")) {
                // Aquí delegaría al nodo que llama al cliente gRPC
                // Por ahora, simulamos que si la tarea es de AI, vuelve al CEO para reporte
                // TODO: Implementar nodo AI Engine
                console.log("Delegación a AI Engine pendiente de implementación de nodo.");
                return "ceo"; 
            }

            return END; // Si no hay plan, terminamos (este caso debería cubrirse antes)
        },
        {
            researcher: "researcher",
            git_worker: "git_worker",
            test_runner: "test_runner",
            ceo: "ceo", // Volver al CEO para consolidar resultados
            __end__: END,
        }
    );

    // Retorno de los Workers al Chief (para validación del resultado)
    workflow.addEdge("researcher", "software_chief");
    workflow.addEdge("git_worker", "software_chief");
    workflow.addEdge("test_runner", "software_chief");

    // El Chief consolida y vuelve al CEO
    workflow.addEdge("software_chief", "ceo");

    return workflow.compile();
};

export const graph = createGraph();
