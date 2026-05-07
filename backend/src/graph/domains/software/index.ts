import { StateGraph, START, END } from "@langchain/langgraph";
import { AgentAnnotation } from "@/graph/state.js";
import { AgentStateType } from "@startup/shared";
import { software_chief_node } from "@/nodes/chiefs/software_chief.js";
import { git_worker_node } from "@/nodes/workers/git_worker_node.js";
import { test_runner_node } from "@/nodes/workers/test_runner_node.js";
import { code_researcher_node } from "@/nodes/workers/code_researcher_node.js";
import { code_writer_node } from "@/nodes/workers/code_writer_node.js";
import { review_worker_node } from "@/nodes/workers/review_worker.js";
import { TelemetryHelper } from "@/helpers/telemetryHelper.js";
import { AuditHelper } from "@/helpers/auditHelper.js";

function wrap(nodeName: string, nodeFn: any) {
    return TelemetryHelper.wrapNode(nodeName, AuditHelper.wrapNode(nodeName, nodeFn));
}

/**
 * Sub-grafo del Dominio de Software.
 * Encapsula la lógica de desarrollo, testing y git.
 */
const softwareWorkflow = new StateGraph(AgentAnnotation)
    .addNode("software_chief", wrap("software_chief", software_chief_node))
    .addNode("git_worker", wrap("git_worker", git_worker_node))
    .addNode("test_runner", wrap("test_runner", test_runner_node))
    .addNode("code_researcher", wrap("code_researcher", code_researcher_node))
    .addNode("code_writer", wrap("code_writer", code_writer_node))
    .addNode("review_worker", wrap("review_worker", review_worker_node))

    .addEdge(START, "software_chief")
    
    // Ruteo interno del Software Chief
    .addConditionalEdges(
        "software_chief",
        (state: AgentStateType) => {
            if (!state.next_node || state.next_node === "ceo" || state.next_node === "end") return "end";
            return state.next_node;
        },
        {
            git_worker: "git_worker",
            test_runner: "test_runner",
            code_researcher: "code_researcher",
            code_writer: "code_writer",
            review_worker: "review_worker",
            end: END
        }
    );

// Todos los workers vuelven al Chief para la siguiente instrucción
const toChief = () => "software_chief" as const;
softwareWorkflow.addEdge("git_worker", "software_chief");
softwareWorkflow.addEdge("test_runner", "software_chief");
softwareWorkflow.addEdge("code_researcher", "software_chief");
softwareWorkflow.addEdge("code_writer", "software_chief");
softwareWorkflow.addEdge("review_worker", "software_chief");

export const software_domain_graph = softwareWorkflow.compile();
