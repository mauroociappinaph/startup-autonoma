import { AgentStateType } from "@startup/shared";
import { LLMService } from "../services/llmService.js";
import { ResearcherResponseSchema } from "@startup/shared";
import { list_dir, read_file } from "../tools/index.js";
import { SystemMessage, AIMessage, ToolMessage, BaseMessage } from "@langchain/core/messages";
import { LLMFactory } from "../services/llmFactory.js";
import { ChatOpenAI } from "@langchain/openai";

/** Lista de herramientas para binding del modelo. */
const toolList = [list_dir, read_file];

/**
 * Nodo ResearchWorker: El explorador técnico.
 * Utiliza herramientas de sistema de archivos para diagnosticar el repositorio.
 */
export async function researcher_node(state: AgentStateType) {
  console.log("--- EJECUTANDO NODO RESEARCHER ---");

  // Casteamos a ChatOpenAI porque NVIDIA usa el bridge OpenAI-compatible
  const model = LLMFactory.createModel({ type: "flow", temperature: 0 }) as ChatOpenAI;
  const modelWithTools = model.bindTools(toolList);

  const system_prompt = new SystemMessage(`
    Eres el ResearchWorker de una Startup Autónoma.
    Tu misión es explorar el repositorio para responder preguntas técnicas del CEO.

    HERRAMIENTAS DISPONIBLES:
    - list_dir: Para ver qué hay en las carpetas.
    - read_file: Para leer el código de archivos específicos.

    ESTRUCTURA DE RAZONAMIENTO:
    1. <thought>: Analiza la misión y los archivos clave a investigar.
    2. <plan>: Pasos para la exploración del repositorio.
    3. <verification>: Confirmación de que la información recolectada es suficiente.

    IMPORTANTE: Sé preciso y técnico. No inventes archivos que no existen.
  `);

  const currentMessages: BaseMessage[] = [system_prompt, ...state.messages];
  let loopCount = 0;
  const MAX_LOOPS = 5;

  console.log("🔍 Investigador iniciando búsqueda...");

  while (loopCount < MAX_LOOPS) {
    const response = await modelWithTools.invoke(currentMessages) as AIMessage;
    currentMessages.push(response);

    if (!response.tool_calls || response.tool_calls.length === 0) {
      break;
    }

    for (const toolCall of response.tool_calls) {
      if (!toolCall.id) continue;
      console.log(`🛠️ Ejecutando herramienta: ${toolCall.name}...`);

      let toolResult: string;

      if (toolCall.name === "list_dir") {
        const result = await list_dir.invoke({ dir_path: toolCall.args.dir_path as string | undefined });
        toolResult = typeof result === "string" ? result : JSON.stringify(result);
      } else if (toolCall.name === "read_file") {
        const result = await read_file.invoke({ file_path: toolCall.args.file_path as string });
        toolResult = typeof result === "string" ? result : JSON.stringify(result);
      } else {
        toolResult = `Error: herramienta desconocida "${toolCall.name}"`;
      }

      currentMessages.push(new ToolMessage({
        content: toolResult,
        tool_call_id: toolCall.id
      }));
    }
    loopCount++;
  }

  // SÍNTESIS FINAL
  console.log("📊 Sintetizando hallazgos de investigación...");

  const { data: synthesisResponse, usage } = await LLMService.getStructuredData(
    { type: "flow", temperature: 0 },
    [
      new SystemMessage("Sintetiza los hallazgos de la investigación técnica en un reporte estructurado."),
      ...currentMessages
    ],
    ResearcherResponseSchema
  );

  return {
    executive_summary: synthesisResponse.findings,
    completed_steps: ["research"],
    iteration_count: 1,
    token_usage: usage,
    next_node: state.active_chief || "ceo",
    messages: [new AIMessage({
      content: `[RESEARCH_REPORT] ${synthesisResponse.conclusion}`,
      additional_kwargs: { research_data: synthesisResponse }
    })]
  };
}
