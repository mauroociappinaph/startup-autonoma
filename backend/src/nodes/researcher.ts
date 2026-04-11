/* eslint-disable @typescript-eslint/no-explicit-any, no-console */
import { AgentStateType } from "../types/state.js";
import { LLMService } from "../services/llmService.js";
import { ResearcherResponseSchema } from "../contracts/researcher.js";
import { systemTools } from "../tools/index.js";
import { SystemMessage, AIMessage, ToolMessage, BaseMessage } from "@langchain/core/messages";
import { LLMFactory } from "../services/llmFactory.js";

/**
 * Nodo ResearchWorker: El explorador técnico.
 * Utiliza herramientas de sistema de archivos para diagnosticar el repositorio.
 */
export async function researcher_node(state: AgentStateType) {
  console.log("--- EJECUTANDO NODO RESEARCHER ---");

  // Usamos el modelo SMART (NVIDIA) para asegurar precisión en la búsqueda
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const model = LLMFactory.createModel({ type: "smart", temperature: 0 }) as any;
  
  // Binding de herramientas para que el modelo pueda "llamarlas"
  const modelWithTools = model.bindTools(systemTools);

  const system_prompt = new SystemMessage(`
    Eres el ResearchWorker de una Startup Autónoma. 
    Tu misión es explorar el repositorio para responder preguntas técnicas del CEO.
    
    HERRAMIENTAS DISPONIBLES:
    - list_dir: Para ver qué hay en las carpetas.
    - read_file: Para leer el código de archivos específicos.
    
    ESTRATEGIA:
    1. Comienza explorando la raíz para entender la estructura.
    2. Lee archivos clave (package.json, src/index.ts, etc.) si es necesario.
    3. Cuando tengas la información completa, genera un reporte final.
    
    IMPORTANTE: Sé preciso y técnico. No inventes archivos que no existen.
  `);

  // Bucle de herramientas simple (Autonomous Loop)
  let currentMessages: BaseMessage[] = [system_prompt, ...state.messages];
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
      console.log(`🛠️ Ejecutando herramienta: ${toolCall.name}...`);
      const tool = systemTools.find(t => t.name === toolCall.name);
      
      if (!tool || !toolCall.id) continue;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const toolResult = await (tool as any).invoke(toolCall.args);
      const content = typeof toolResult === "string" ? toolResult : JSON.stringify(toolResult);
      currentMessages.push(new ToolMessage({
        content: content,
        tool_call_id: toolCall.id
      }));
    }
    loopCount++;
  }

  // SÍNTESIS FINAL
  console.log("📊 Sintetizando hallazgos de investigación...");
  
  const synthesisResponse = await LLMService.getStructuredResponse(
    { type: "smart", temperature: 0 },
    [
      new SystemMessage("Sintetiza los hallazgos de la investigación técnica en un reporte estructurado."),
      ...currentMessages
    ],
    ResearcherResponseSchema
  );

  return {
    executive_summary: synthesisResponse.findings,
    messages: [new AIMessage(`[RESEARCH_REPORT] ${synthesisResponse.conclusion}`)]
  };
}
