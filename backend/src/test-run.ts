import "dotenv/config";
import { graph } from "./graph/index.js";
import { HumanMessage } from "@langchain/core/messages";

/**
 * Script de validación en tiempo real para el grafo.
 * Simula una interacción donde el CEO debe delegar investigación al Worker.
 */
async function runTest() {
  console.log("🚀 Iniciando ejecución de prueba del Grafo...");

  const initialInput = {
    messages: [new HumanMessage("Haz una investigación completa del repo: busca los contratos Zod y el estado del grafo, luego dame un resumen ejecutivo.")],
    plan: ["research", "summarize"],
    executive_summary: "",
    retry_count: 0,
    trace_id: "test-synthesis-" + Date.now()
  };

  try {
    const stream = await graph.stream(initialInput);
    
    for await (const step of stream) {
      console.log("--- PASO DEL GRAFO ---");
      console.log(JSON.stringify(step, null, 2));
    }

    console.log("✅ Ejecución de prueba finalizada.");
  } catch (error) {
    console.error("❌ Error en la ejecución del grafo:", error);
  }
}

runTest();
