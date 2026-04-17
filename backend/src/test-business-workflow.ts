import "dotenv/config";
import { getGraph } from "./graph/index.js";
import { HumanMessage } from "@langchain/core/messages";

/**
 * Script de prueba para validar el flujo completo del Business Chief.
 */
async function testBusinessWorkflow() {
  console.log("🚀 Iniciando Test de Flujo Comercial...");

  const initialInput = {
    messages: [new HumanMessage("Hola, quiero lanzar una startup de panaderías artesanales en Buenos Aires. ¿Podés investigar el mercado y decirme qué necesito?")],
    plan: [],
    executive_summary: "",
    retry_count: 0
  };

  const config = { configurable: { thread_id: "test-business-1" } };

  const graph = await getGraph();
  const eventStream = graph.streamEvents(initialInput, { ...config, version: "v2" });

  for await (const event of eventStream) {
    const eventType = event.event;
    const nodeName = event.metadata?.langgraph_node;

    if (eventType === "on_node_start" && nodeName) {
      console.log(`\n--- [INICIO]: Nodo ${nodeName} ---`);
    }

    if (eventType === "on_node_end" && nodeName) {
      console.log(`--- [FIN]: Nodo ${nodeName} ---\n`);
      const output = event.data.output;
      if (output && Object.keys(output)[0] === nodeName) {
        const nodeOutput = output[nodeName];
        if (nodeOutput.executive_summary) {
          console.log(`📝 Resumen: ${nodeOutput.executive_summary}`);
        }
      }
    }
  }

  console.log("\n✅ Test de Flujo Comercial completado.");
}

testBusinessWorkflow().catch(console.error);
