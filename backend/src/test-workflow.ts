import "dotenv/config";
import { graph } from "./graph/index.js";
import { HumanMessage } from "@langchain/core/messages";

/**
 * Test de Workflow: CEO -> SoftwareChief -> Researcher.
 * Usamos un input que facilite al Chief detectar la tarea de 'research'.
 */
async function runWorkflowTest() {
  console.log("🧪 Iniciando Test de Workflow Jerárquico...");

  const initialInput = {
    messages: [new HumanMessage("Perform a technical research of the Zod contracts in the backend folder.")],
    plan: [],
    executive_summary: "",
    retry_count: 0
  };

  try {
    const stream = await graph.stream(initialInput, { streamMode: "values" });
    
    for await (const step of stream) {
      if (step.active_chief) {
        console.log(`\n[CHIEF ACTIVE]: ${step.active_chief}`);
        console.log(`[PLAN ACTUAL]: ${JSON.stringify(step.plan)}`);
      }
      
      if (step.executive_summary && step.executive_summary.length > 50) {
        console.log(`\n[SUMMARY]: ${step.executive_summary.substring(0, 100)}...`);
      }
    }

    console.log("\n✅ Test finalizado.");
  } catch (error) {
    console.error("❌ Error en el test:", error);
  }
}

runWorkflowTest();
