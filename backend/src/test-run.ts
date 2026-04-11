/* eslint-disable */
/* eslint-disable */
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
        new HumanMessage("Hola CEO! Analiza el estado del proyecto y definamos el plan para hoy."),
      ],
    };

    console.log("🕸️ Iniciando ejecución del Grafo con NVIDIA Nemotron...");
    
    const result = await graph.invoke(initialState, {
        configurable: { thread_id: "test-session-1" }
    });

    console.log("\n--- RESULTADO DEL GRAFO ---");
    console.log("Análisis del CEO:", result.executive_summary);
    console.log("Número de mensajes en historial:", result.messages.length);
    console.log("---------------------------\n");

    console.log("✅ Ciclo del CEO completado con éxito a través del Grafo.");
  } catch (error) {
    console.error("❌ Error en la ejecución del test:", error);
  }
}

testExecution();
