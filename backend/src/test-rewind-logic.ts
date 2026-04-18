import { StateGraph, START, END, MemorySaver } from "@langchain/langgraph";
import { v4 as uuidv4 } from "uuid";

/**
 * Demo Real de Lógica de Rewind (Sin Dependencia de LLM).
 * Este script demuestra cómo LangGraph persiste el estado y cómo podemos
 * volver atrás en el tiempo usando la API de historial.
 */

// 1. Definimos un Grafo Ultra-Simple
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const demoWorkflow = new StateGraph<any>({
  channels: {
    count: {
       value: (x: number, y: number) => y,
       default: () => 0
    }
  }
})
  .addNode("step_1", (_state) => ({ count: 1 }))
  .addNode("step_2", (_state) => ({ count: 2 }))
  .addNode("step_3", (_state) => ({ count: 3 }))
  .addEdge(START, "step_1")
  .addEdge("step_1", "step_2")
  .addEdge("step_2", "step_3")
  .addEdge("step_3", END);

// Usamos el checkpointer (memoria para el hilo)
const memory = new MemorySaver();
const app = demoWorkflow.compile({ checkpointer: memory });

async function runRewindDemo() {
  const threadId = `rewind-demo-${uuidv4().substring(0, 4)}`;
  const config = { configurable: { thread_id: threadId } };

  console.log(`🚀 Iniciando ejecución en thread: ${threadId}`);
  
  // Ejecutamos el grafo completo
  await app.invoke({ count: 0 }, config);
  console.log("✅ Ejecución inicial completada (Steps 1, 2, 3)");

  // 2. Ver historial de checkpoints
  console.log("\n📜 Consultando Historial de Checkpoints...");
  const history = [];
  for await (const state of app.getStateHistory(config)) {
    history.push({
      checkpointId: state.config.configurable?.checkpoint_id,
      nextNode: state.next,
      count: state.values.count
    });
  }

  history.forEach((h, i) => {
    console.log(`   [T-${i}] ID: ${h.checkpointId?.substring(0, 8)} | Nodo Siguiente: ${h.nextNode} | Valor 'count': ${h.count}`);
  });

  // 3. Seleccionar un punto para REWIND (por ejemplo, después del Step 1)
  // El historial suele venir: [Final, Step 3, Step 2, Step 1, Start]
  const targetCheckpoint = history.find(h => h.count === 1);
  
  if (targetCheckpoint) {
    console.log(`\n⏪ Haciendo REWIND al punto donde count = 1 (Checkpoint: ${targetCheckpoint.checkpointId?.substring(0, 8)})`);
    
    // Obtenemos el estado de ese checkpoint
    const targetState = await app.getState({ 
      configurable: { 
        thread_id: threadId, 
        checkpoint_id: targetCheckpoint.checkpointId 
      } 
    });

    // Restauramos ese estado al hilo actual
    await app.updateState(config, targetState.values);
    
    console.log("✅ Rewind completado.");

    // 4. Verificar estado post-rewind
    const currentState = await app.getState(config);
    console.log(`\n🕵️ Verificando estado actual:`);
    console.log(`   Valor de 'count': ${currentState.values.count}`);
    console.log(`   Siguiente acción sugerida por el grafo: ${currentState.next}`);
    
    if (currentState.values.count === 1) {
      console.log("\n🎉 ¡ÉXITO! Hemos viajado en el tiempo.");
    }
  }

  process.exit(0);
}

runRewindDemo().catch(console.error);
