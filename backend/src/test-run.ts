import "dotenv/config";
import { getGraph } from "./graph/index.js";
import { HumanMessage } from "@langchain/core/messages";

/**
 * Startup CLI Test Runner
 * Ejecuta el grafo completo empezando por el Mirror Agent.
 */
async function runTest() {
  const userPrompt = process.argv[2] || "Investigá el repositorio y creame una branch para documentar los tipos";
  const graph = await getGraph();
  
  console.log("==========================================================");
  console.log("🏢 STARTUP AUTÓNOMA: Iniciando Ejecución");
  console.log(`👤 Usuario: "${userPrompt}"`);
  console.log("==========================================================\n");

  const initialInput = {
    messages: [new HumanMessage(userPrompt)],
    original_prompt: userPrompt,
    refined_prompt: "",
    executive_summary: "",
    retry_count: 0,
    trace_id: "cli-run-" + Date.now(),
    plan: [],
    active_chief: ""
  };

  try {
    const stream = await graph.stream(initialInput, {
      configurable: { thread_id: `cli-test-${Date.now()}` }
    });
    
    for await (const step of stream) {
      const nodeName = Object.keys(step)[0];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const output = (step as any)[nodeName];

      console.log(`\n==========================================================`);
      console.log(`🚀 [EXECUTION TIER] -> NODO ACTIVO: ${nodeName.toUpperCase()}`);
      
      // Intentamos extraer el tier basado en la convención
      let tier = "UNKNOWN";
      if (['aduana_sentinel', 'mirror', 'ceo', 'security_worker'].includes(nodeName)) tier = "🧠 REASONING (GLM-5.1)";
      else if (['software_chief', 'business_chief', 'operations_chief', 'review_worker'].includes(nodeName)) tier = "👑 ULTRA (Nemotron-340B)";
      else if (['researcher', 'documentation_worker', 'git_worker'].includes(nodeName)) tier = "⚡ FLOW (Llama-3.1-8B)";
      
      console.log(`📡 TIER DE IA APLICADO: ${tier}`);
      console.log(`==========================================================`);

      // Mostrar el razonamiento crudo si existe (estructuras XML)
      const lastMessage = output.messages?.[output.messages.length - 1];
      if (lastMessage && lastMessage.content) {
        console.log(`\n[📥 RESPUESTA CRUDA DE LA IA]`);
        console.log(lastMessage.content);
      } else if (output.reasoning) {
        console.log(`\n[📥 RAZONAMIENTO ESTRUCTURADO]`);
        console.log(output.reasoning);
      }

      console.log(`\n[🛠️  ESTADO RESULTANTE]`);
      if (output.executive_summary) {
        console.log(`📝 Executive Summary: ${output.executive_summary}`);
      }
      if (output.plan && output.plan.length > 0) {
        console.log(`📋 Plan actual: ${output.plan.join(' -> ')}`);
      }
      if (output.active_chief) {
        console.log(`👤 Delegación a: ${output.active_chief}`);
      }
    }

    console.log("\n==========================================================");
    console.log("✅ FLUJO COMPLETO FINALIZADO CON ÉXITO");
    console.log("==========================================================");
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as any;
    console.error("\n❌ ERROR CRÍTICO EN EL GRAFO:", err.message);
  }
}

runTest();
