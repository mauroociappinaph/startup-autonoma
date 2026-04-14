import { AgentStateType } from "@/types/state.types.js";
import { LLMService } from "@/services/llmService.js";
import { SystemMessage, AIMessage } from "@langchain/core/messages";
import { z } from "zod";
import { GitActionSchema } from "@/types/git-worker.types.js";

/**
 * Esquema de decisión interna del Software Chief.
 * Determina el siguiente paso técnico y la instrucción para el worker.
 */
const SoftwareChiefDecisionSchema = z.object({
  decision: z.enum(["delegate_to_researcher", "delegate_to_git_worker", "complete", "need_clarification"]),
  reasoning: z.string().describe("Explicación técnica de por qué se toma esta decisión."),
  worker_instruction: z.string().optional().describe("Instrucción en lenguaje natural para el worker (si aplica)."),
  git_payload: GitActionSchema.optional().describe("Carga útil estructurada si se delega al Git Worker."),
});

/**
 * Nodo SoftwareChief: Supervisor Técnico de Elite.
 * Coordina Workers, desglosa tareas y asegura el cumplimiento de estándares.
 */
export async function software_chief_node(state: AgentStateType) {
  console.log("--- EJECUTANDO NODO SOFTWARE CHIEF ---");

  const system_prompt = new SystemMessage(`
    Eres el SoftwareChief de una Startup Autónoma. 
    Tu misión es recibir misiones del CEO y coordinar la ejecución técnica usando Workers.

    TUS HERRAMIENTAS (WORKERS):
    1. ResearchWorker: Para explorar el repo, leer archivos y entender la arquitectura actual.
    2. GitWorker: Para crear branches, hacer commits, pull/push y sincronizar el repo.

    ESTRATEGIA:
    - Si la misión requiere entender código existente o investigar librerías, delega al ResearchWorker.
    - Si la misión requiere preparar el entorno (ej: crear una branch para una feature), delega al GitWorker.
    - Asegúrate de que las acciones de Git sean coherentes (ej: no intentes commitear si no hay cambios).
    - Siempre explica tu razonamiento técnico.

    LEYES SAGRADAS (Debes vigilar que se cumplan):
    - SRP, DRY, Barrel Files, Límite de 300 líneas por archivo.
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
    else if (response.decision === "complete") {
      updates.plan = [];
      updates.executive_summary = response.reasoning;
    }

    return updates;
  } catch (error: any) {
    console.error("❌ Fallo en el Nodo SoftwareChief:", error);
    throw error;
  }
}
