import { graph } from "./graph/index.js";
import { BaseMessage } from "@langchain/core/messages";

async function runTest() {
  console.log("🚀 Iniciando prueba de ejecución del Grafo...");

  // Estado inicial simulando una petición de investigación
  const initialState = {
    messages: [{ role: "user", content: "Investiga el estado actual del repositorio" } as any],
    plan: ["research"],
    results: [],
    feedback: [],
    status: "planning",
    trace_id: "test-run-" + Date.now(),
    metadata: {},
  };

  try {
    console.log("🤖 CEO iniciando plan de delegación...");
    const result = await graph.invoke(initialState);
    
    console.log("\n✅ Resultado final del Grafo:");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("\n❌ Error en la ejecución del grafo:", error);
  }
}

runTest();
