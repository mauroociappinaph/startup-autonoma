import { AgentStateType } from "@/types/state.types.js";
import { LLMService } from "@/services/llmService.js";
import { SystemMessage, AIMessage } from "@langchain/core/messages";
import { z } from "zod";
import { GitActionSchema } from "@/types/git-worker.types.js";
import { TelemetryService } from "@/services/telemetryService.js";
import { AuditService } from "@/services/auditService.js";
import { TestRunnerInputSchema } from "@/types/software-tools.types.js";

/**
 * Esquema de decisión interna del Software Chief.
 */
const SoftwareChiefDecisionSchema = z.object({
  reasoning: z.string().describe("Explicación técnica de por qué se toma esta decisión."),
  decision: z.enum([
    "delegate_to_researcher",
    "delegate_to_code_researcher", // Nuevo worker determinista
    "delegate_to_git_worker",
    "delegate_to_test_runner",
    "delegate_to_ai_engine", // Nueva decisión para el AI Engine
    "complete",
    "need_clarification"
  ]),
  worker_instruction: z.string().nullable().optional().describe("Instrucción en lenguaje natural para el worker (si aplica)."),
  git_payload: GitActionSchema.nullable().optional().describe("Carga útil estructurada si se delega al Git Worker."),
  test_payload: TestRunnerInputSchema.nullable().optional().describe("Carga útil estructurada si se delega al Test Runner."),
  ai_engine_task: z.object({ // Payload específico para el AI Engine
    worker_name: z.string().describe("Nombre del worker específico en el AI Engine (ej: 'lead_gen', 'market_analyst')."),
    task_description: z.string().describe("Descripción de la tarea a ejecutar."),
    payload: z.any().optional().describe("Datos de entrada para el worker."),
  }).nullable().optional().describe("Instrucción para el AI Engine si la decisión es delegar a este servicio."),
  code_researcher_payload: z.any().optional().describe("Carga útil estructurada para el Code Researcher.")
});

/**
 * Nodo SoftwareChief: Supervisor Técnico de Elite.
 * Ahora capaz de delegar tareas al AI Engine y manejar respuestas nulas.
 */
export async function software_chief_node(state: AgentStateType) {
  console.log("--- EJECUTANDO NODO SOFTWARE CHIEF ---");

  const system_prompt = new SystemMessage(`
    Eres el SoftwareChief de una Startup Autónoma.
    Tu misión es recibir misiones del CEO y coordinar la ejecución técnica usando Workers y servicios externos como el AI Engine.

    TUS HERRAMIENTAS (WORKERS Y SERVICIOS EXTERNOS):
    1. ResearchWorker: Para explorar el repo, leer archivos y entender la arquitectura actual.
    2. GitWorker: Para crear branches, hacer commits, pull/push y sincronizar el repo.
    3. TestRunner: Para ejecutar suites de tests y validar la calidad del código.
    4. AI Engine (gRPC): Para tareas pesadas como scraping, análisis de datos o ML. Debes especificar el 'worker_name' (ej: 'lead_gen').

    ESTRATEGIA:
    - SIEMPRE que un Worker técnico entregue trabajo, debes delegar al TestRunner para validar.
    - Si la misión requiere análisis de datos externos o tareas intensivas, considera delegar al AI Engine.
    - Solo marca la misión como "complete" si los tests pasaron y se cumplen las Leyes Sagradas.

    LEYES SAGRADAS:
    - KISS & SOLID, SRP, DRY, Barrel Files.
    - Código generado debe ser predecible y testable.

    NOTAS SOBRE COORDINACIÓN:
    - Tú solo eres responsable de la parte TÉCNICA (código, git, tests).
    - Si ya terminaste tu parte técnica pero el pedido original incluía tareas de negocio (investigación de mercado, leads, etc.), responde con 'complete' y aclara en tu razonamiento que la parte técnica está lista pero la parte comercial sigue pendiente.
  `);

  try {
    const { data: response, usage, cost, latency } = await LLMService.getStructuredData(
      { type: "smart", temperature: 0 },
      [system_prompt, ...state.messages],
      SoftwareChiefDecisionSchema
    );

    const projectId = state.project_context?.projectId || "unknown";

    // 1. Telemetría
    await TelemetryService.recordMetric(projectId, {
      node: "Software Chief",
      model: "gpt-4o",
      latency,
      usage
    });

    // 2. Auditoría
    await AuditService.logDecision(projectId, {
      agent: "Software Chief",
      decision: response.decision,
      reasoning: response.reasoning
    });

    console.log(`🧠 Chief Reasoning: ${response.reasoning}`);
    console.log(`🎯 Decision: ${response.decision}`);
    console.log(`📊 Costo: $${cost.toFixed(6)}`);

    const updates: Partial<AgentStateType> = {
      executive_summary: response.reasoning,
      active_chief: "software_chief",
      iteration_count: 1,
      token_usage: usage,
      total_cost_usd: cost,
      messages: state.messages.concat([new AIMessage({
        content: `[SOFTWARE_CHIEF_THOUGHT] ${response.reasoning}
[DECISION] ${response.decision}`,
      })])
    };

    if (response.decision === "delegate_to_researcher") {
      updates.plan = ["research"];
      updates.next_node = "researcher";
      updates.messages?.push(new AIMessage({
        content: `[CHIEF_DELEGATION] Delegando investigación inteligente: ${response.worker_instruction || 'Tarea de investigación requerida.'}`,
      }));
    }
    else if (response.decision === "delegate_to_code_researcher") {
      updates.plan = ["code_research"];
      updates.next_node = "code_researcher";
      updates.messages?.push(new AIMessage({
        content: `[CHIEF_DELEGATION] Delegando exploración técnica determinista: ${response.reasoning}`,
        additional_kwargs: {
          code_researcher_instruction: response.code_researcher_payload
        }
      }));
    }
    else if (response.decision === "delegate_to_git_worker") {
      updates.plan = ["git_operation"];
      updates.next_node = "git_worker";
      updates.messages?.push(new AIMessage({
        content: `[CHIEF_DELEGATION] Delegando operación Git: ${response.reasoning}`,
        additional_kwargs: {
          git_instruction: {
            payload: response.git_payload!,
            repoPath: process.cwd()
          }
        }
      }));
    }
    else if (response.decision === "delegate_to_test_runner") {
      updates.plan = ["test_operation"];
      updates.next_node = "test_runner";
      updates.messages?.push(new AIMessage({
        content: `[CHIEF_DELEGATION] Delegando validación de tests: ${response.reasoning}`,
        additional_kwargs: {
          test_instruction: response.test_payload!
        }
      }));
    }
    else if (response.decision === "delegate_to_ai_engine") {
      updates.plan = ["ai_engine_task"];
      updates.next_node = "ai_engine_worker";
      updates.messages?.push(new AIMessage({
        content: `[CHIEF_DELEGATION] Delegando tarea al AI Engine: ${response.reasoning}`,
        additional_kwargs: {
          ai_engine_task: {
            worker_name: response.ai_engine_task!.worker_name,
            task_description: response.ai_engine_task!.task_description,
            trace_id: state.trace_id || "unknown-trace", // Usamos trace_id del estado o uno por defecto
            payload: response.ai_engine_task!.payload || {},
          }
        }
      }));
    }
    else if (response.decision === "need_clarification") {
      updates.plan = []; // Detenemos el plan hasta tener más info
      updates.next_node = "ceo"; // Volvemos al CEO vía guardian
      updates.executive_summary = `El Software Chief necesita aclaración: ${response.reasoning}`;
      updates.messages?.push(new AIMessage({
        content: `[CHIEF_CLARIFICATION] ${response.reasoning}`,
      }));
    }
    else if (response.decision === "complete") {
      updates.plan = [];
      updates.next_node = "ceo"; 
      updates.completed_steps = ["software_chief"];
      updates.executive_summary = response.reasoning;
    }

    return updates;
  } catch (error) {
    console.error("❌ Error en el Software Chief:", error);
    return {
      messages: state.messages.concat([new AIMessage({
        content: `[CHIEF_ERROR] Error procesando la misión: ${error instanceof Error ? error.message : String(error)}`
      })]),
      plan: [],
      executive_summary: `Error interno del Software Chief: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}
