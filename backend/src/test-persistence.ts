import { persistence_node } from "./nodes/workers/persistence_node.js";
import { AgentStateType } from "./types/state.types.js";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

/**
 * Script de prueba para validar el Nodo de Persistencia
 */
async function testPersistence() {
  console.log("🚀 Iniciando prueba del Nodo de Persistencia...");

  // 1. Simulamos un estado donde el Business Chief acaba de encontrar un Lead
  // y lo deja en additional_kwargs para que el persistence_node lo guarde.
  const initialState: AgentStateType = {
    original_prompt: "Buscá leads de fintech en Argentina",
    refined_prompt: "Buscá leads de fintech en Argentina",
    executive_summary: "Simulación de búsqueda de leads",
    retry_count: 0,
    messages: [
      new HumanMessage("Buscá leads de fintech en Argentina"),
      new AIMessage({
        content: "Encontré un lead interesado en nuestra solución.",
        additional_kwargs: {
          engram_data: {
            title: "Nuevo Lead: Fintech Arg",
            type: "lead",
            topic_key: "leads/fintech/ar",
            content: {
              What: "Empresa X interesada en integración gRPC.",
              Why: "Tienen problemas de latencia en su backend."
            }
          }
        }
      })
    ],
    plan: ["persist_memory"],
    active_chief: "business_chief",
    completed_steps: [],
    iteration_count: 0,
    token_usage: { total: 0, prompt: 0, completion: 0 }
  };

  try {
    // 2. Ejecutamos el nodo
    const result = await persistence_node(initialState);

    // 3. Verificamos el resultado
    const lastMessage = result.messages[result.messages.length - 1];
    
    console.log("\n--- RESULTADO ---");
    console.log("Contenido del mensaje:", lastMessage.content);
    
    if (lastMessage.content.toString().includes("[WORKER_RESULT] Datos persistidos correctamente")) {
      console.log("\n✅ ¡PRUEBA EXITOSA! El Archivista guardó la memoria correctamente.");
    } else {
      console.log("\n❌ LA PRUEBA FALLÓ. El mensaje no tiene el formato esperado.");
    }

  } catch (error) {
    console.error("💥 ERROR CRÍTICO durante la prueba:", error);
  }
}

testPersistence();
