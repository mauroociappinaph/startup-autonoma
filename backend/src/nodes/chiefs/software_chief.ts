import { AgentStateType } from "@/types/state.types.js";
import { LLMService } from "@/services/llmService.js";
import { SystemMessage, AIMessage } from "@langchain/core/messages";
import { z } from "zod";
import { GitActionSchema } from "@/types/git-worker.types.js";
import { TestRunnerInputSchema, TestRunnerInput } from "@/types/software-tools.types.js";

/**
 * Esquema de decisión interna del Software Chief.
 */
const SoftwareChiefDecisionSchema = z.object({
  decision: z.enum([
    "delegate_to_researcher", 
    "delegate_to_git_worker", 
    "delegate_to_test_runner",
    "complete", 
    "need_clarification"
  ]),
  reasoning: z.string().describe("Explicación técnica de por qué se toma esta decisión."),
  worker_instruction: z.string().optional().describe("Instrucción en lenguaje natural para el worker (si aplica)."),
  git_payload: GitActionSchema.optional().describe("Carga útil estructurada si se delega al Git Worker."),
  test_payload: TestRunnerInputSchema.optional().describe("Carga útil estructurada si se delega al Test Runner."),
});

/**
 * Nodo SoftwareChief: Supervisor Técnico de Elite.
 */
export async function software_chief_node(state: AgentStateType) {
  console.log("--- EJECUTANDO NODO SOFTWARE CHIEF ---");

  const system_prompt = new SystemMessage(`
    Eres el SoftwareChief de una Startup Autónoma. 
    Tu misión es recibir misiones del CEO y coordinar la ejecución técnica usando Workers.

    TUS HERRAMIENTAS (WORKERS):
    1. ResearchWorker: Para explorar el repo, leer archivos y entender la arquitectura actual.
    2. GitWorker: Para crear branches, hacer commits, pull/push y sincronizar el repo.
    3. TestRunner: Para ejecutar suites de tests y validar la calidad del código.

    ESTRATEGIA:
    - SIEMPRE que un Worker técnico entregue trabajo, debes delegar al TestRunner para validar que no haya regresiones.
    - Solo marca la misión como "complete" si los tests pasaron y se cumplen las Leyes Sagradas.
  `);

  try {
    const response = await LLMService.getStructuredResponse(
      { type: "smart", temperature: 0 },
      [system_prompt, ...state.messages],
      SoftwareChiefDecisionSchema
    );

    console.log(`🧠 Chief Reasoning: ${response.reasoning}`);
    console.log(`🎯 Decision: ${response.decision}`);

    const updates: Partial<AgentStateType> = {
      active_chief: "software_chief",
    };

    if (response.decision === "delegate_to_researcher") {
      updates.plan = ["research"];
      updates.messages = [new AIMessage({
        content: `[CHIEF_DELEGATION] Delegando investigación: ${response.worker_instruction}`,
      })];
    } 
    else if (response.decision === "delegate_to_git_worker") {
      updates.plan = ["git_operation"];
      updates.messages = [new AIMessage({
        content: `[CHIEF_DELEGATION] Delegando operación Git: ${response.reasoning}`,
        additional_kwargs: {
          git_instruction: {
            payload: response.git_payload,
            repoPath: process.cwd()
          }
        }
      })];
    }
    else if (response.decision === "delegate_to_test_runner") {
      updates.plan = ["test_operation"];
      updates.messages = [new AIMessage({
        content: `[CHIEF_DELEGATION] Delegando validación de tests: ${response.reasoning}`,
        additional_kwargs: {
          test_instruction: response.test_payload as TestRunnerInput
        }
      })];
    }
    else if (response.decision === "complete") {
      updates.plan = [];
      updates.executive_summary = response.reasoning;
    }

    return updates;
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as any;
    console.error("❌ Fallo en el Nodo SoftwareChief:", err.message);
    throw err;
  }
}
