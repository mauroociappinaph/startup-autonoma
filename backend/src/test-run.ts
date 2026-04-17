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
      // Configuramos el punto de interrupción si quisiéramos HITL real aquí
      // checkpoint: { thread_id: "1" } 
    });
    
    for await (const step of stream) {
      const nodeName = Object.keys(step)[0];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const output = (step as any)[nodeName];

      console.log(`\n--- 🔄 PASO: [${nodeName.toUpperCase()}] ---`);
      
      if (output.executive_summary) {
        console.log(`📝 Resumen: ${output.executive_summary}`);
      }

      if (output.refined_prompt) {
        console.log(`✨ Prompt Refinado por Mirror: "${output.refined_prompt}"`);
      }

      // Si el nodo es el Mirror, mostramos el desglose técnico
      if (nodeName === 'mirror' && output.messages?.[0]?.additional_kwargs?.mirror_data) {
        const data = output.messages[0].additional_kwargs.mirror_data;
        console.log("🎯 Intenciones detectadas:", data.intentions.join(", "));
        console.log("⚠️ Info faltante:", data.missing_info.join(", ") || "Ninguna");
      }

      if (nodeName === 'ceo') {
        console.log(`🧠 Razón de la decisión: ${output.messages?.[0]?.content || 'N/A'}`);
      }
    }

    console.log("\n==========================================================");
    console.log("✅ FLUJO FINALIZADO CON ÉXITO");
    console.log("==========================================================");
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as any;
    console.error("\n❌ ERROR CRÍTICO EN EL GRAFO:", err.message);
  }
}

runTest();
