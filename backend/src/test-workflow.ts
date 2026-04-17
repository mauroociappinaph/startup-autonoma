import "dotenv/config";
import { getGraph } from "./graph/index.js";
import { HumanMessage } from "@langchain/core/messages";

/**
 * Test de Workflow: CEO -> SoftwareChief -> Researcher.
 * Usamos un input que facilite al Chief detectar la tarea de 'research'.
 */
async function runWorkflowTest() {
  console.log("🧪 Iniciando Test de Workflow Jerárquico...");
  const graph = await getGraph();

  const initialInput = {
    messages: [new HumanMessage("Perform a technical research of the Zod contracts in the backend folder.")],
    plan: [],
    executive_summary: "",
    retry_count: 0
  };

  try {
    const stream = await graph.stream(initialInput, { streamMode: "values" });

    for await (const step of stream) {
      console.log("--- PASO DEL GRAFO ---");
      console.log(JSON.stringify(step, null, 2));
    }

    console.log("\n✅ Ejecución de prueba finalizada.");
  } catch (error) {
    console.error("❌ Error en la ejecución del grafo:", error);
  }
}

runWorkflowTest();
