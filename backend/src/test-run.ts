import "dotenv/config";
import { graph } from "./graph/index.js";
import { HumanMessage } from "@langchain/core/messages";

/**
 * Script de Probeta: Despierta al CEO y prueba el Grafo.
 */
async function testExecution() {
  console.log("🚀 Instandiando Grafo y despertando al CEO...");

  try {
    const initialState = {
      messages: [
        new HumanMessage("Hola CEO! Confirmame que podés leer este mensaje y decime qué modelo de IA sos."),
      ],
    };

    console.log("📨 Enviando mensaje al modelo de NVIDIA...");
    
    // Invocamos el modelo directamente sin grafo para diagnosticar
    const { LLMFactory } = await import("./services/llmFactory.js");
    const model = LLMFactory.createModel({ type: "smart" });
    const response = await model.invoke(initialState.messages);

    console.log("\n--- RESPUESTA DE NVIDIA ---");
    console.log(response.content);
    console.log("---------------------------\n");

    console.log("✅ Conectividad con NVIDIA confirmada.");
  } catch (error) {
    console.error("❌ Error en la ejecución del test:", error);
  }
}

testExecution();
