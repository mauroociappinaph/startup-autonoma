import "dotenv/config";
import { graph } from "./graph/index.js";
import { BaseMessage, HumanMessage } from "@langchain/core/messages";

/**
 * Script de validación en tiempo real para el grafo.
 * Simula una interacción donde el CEO debe delegar investigación al Worker.
 */
async function runTest() {
  console.log("🚀 Iniciando ejecución de prueba del Grafo...");

  const initialInput = {
    messages: [new HumanMessage("Analiza la estructura del proyecto y dime dónde están los contratos de Zod.")],
    plan: ["research", "summarize"],
    executive_summary: "",
    retry_count: 0,
    trace_id: "test-run-" + Date.now()
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
