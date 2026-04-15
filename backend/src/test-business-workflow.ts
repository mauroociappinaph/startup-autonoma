import "dotenv/config";
import { graph } from "./graph/index.js";
import { HumanMessage } from "@langchain/core/messages";

/**
 * Test de Workflow de Negocio: CEO -> BusinessChief -> AI Engine (Lead Gen).
 */
async function runBusinessWorkflowTest() {
  console.log("💼 Iniciando Test de Workflow de Negocio (Startup Autónoma)...");

  // Prompt hiper-específico para que el Business Chief no pida aclaraciones
  const initialInput = {
    messages: [new HumanMessage("Busca 5 leads de empresas Fintech en México, específicamente en el sector de 'Préstamos Personales', que estén en etapa 'Serie A'. Necesito nombre, email de contacto y su ubicación.")],
    plan: [],
    executive_summary: "",
    retry_count: 0,
    trace_id: `test-biz-${Date.now()}`
  };

  try {
    const stream = await graph.stream(initialInput, { 
        streamMode: "values",
        configurable: { thread_id: "test-thread-1" }
    });

    console.log("🚀 El flujo ha comenzado. Observando razonamiento de los Agentes...");

    for await (const step of stream) {
      const lastMsg = step.messages[step.messages.length - 1];
      const content = typeof lastMsg.content === 'string' ? lastMsg.content : JSON.stringify(lastMsg.content);
      
      // Filtramos para mostrar solo los pensamientos de los jefes y resultados
      if (content.includes("[CEO_THOUGHT]") || 
          content.includes("[BUSINESS_CHIEF_THOUGHT]") ||
          content.includes("[BUSINESS_DELEGATION]") ||
          content.includes("[WORKER_RESULT]")) {
        
        console.log("\n--------------------------------------------------");
        console.log(`🤖 AGENTE DICE:`);
        console.log(content);
        
        if (lastMsg.additional_kwargs?.ai_engine_task) {
            console.log(`📦 PAYLOAD gRPC: ${JSON.stringify(lastMsg.additional_kwargs.ai_engine_task, null, 2)}`);
        }
      }
    }

    console.log("\n✅ Test de integración de negocio finalizado.");
  } catch (error) {
    console.error("❌ Error en la ejecución del grafo comercial:", error);
  }
}

runBusinessWorkflowTest();
