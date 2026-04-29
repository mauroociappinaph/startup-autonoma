import "dotenv/config";
import { getGraph } from "./graph/index.js";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { projectService } from "./services/projectService.js";

/**
 * STARTUP AUTÓNOMA: Full Autonomy E2E Test
 * Este script ejecuta el ciclo completo y auto-aprueba las interrupciones HITL.
 */
async function runFullAutonomyTest() {
  const userPrompt = "Documentá el funcionamiento interno del DocumentationWorker en un nuevo archivo markdown en /docs/agents/workers/documentation.md basándote en su código fuente.";
  const graph = await getGraph();
  const thread_id = `autonomy-test-${Date.now()}`;
  const config = { configurable: { thread_id } };

  // Inicializar contexto de proyecto para evitar errores de FK en auditoría
  const projectContext = await projectService.getOrCreateProject("test-project", "https://github.com/mauroociappinaph/startup-autonoma");

  console.log("\n" + "=".repeat(60));
  console.log("🚀 INICIANDO TEST DE AUTONOMÍA TOTAL");
  console.log(`📝 MISIÓN: ${userPrompt}`);
  console.log("=".repeat(60) + "\n");

  const initialInput = {
    messages: [new HumanMessage(userPrompt)],
    original_prompt: userPrompt,
    trace_id: "test-e2e-" + Date.now(),
    project_context: projectContext
  };

  try {
    let currentInput: typeof initialInput | null = initialInput;
    let finished = false;

    while (!finished) {
      const stream = await graph.stream(currentInput, config);

      for await (const step of stream) {
        const nodeName = Object.keys(step as object)[0];
        const output = (step as unknown as Record<string, unknown>)[nodeName] as Record<string, unknown>;

        console.log(`\n>>> [NODO: ${nodeName.toUpperCase()}]`);

        // Extraer y mostrar razonamiento XML
        if (output && output.reasoning) {
            console.log("\n--- RAZONAMIENTO (CoT) ---");
            console.log(output.reasoning);
            console.log("--------------------------");
        }

        // Mostrar mensajes relevantes
        if (output && Array.isArray(output.messages)) {
            const lastMsg = output.messages[output.messages.length - 1];
            if (lastMsg instanceof AIMessage) {
                const contentStr = typeof lastMsg.content === "string" ? lastMsg.content : JSON.stringify(lastMsg.content);
                console.log(`\n[IA]: ${contentStr.substring(0, 1000)}${contentStr.length > 1000 ? '...' : ''}`);
            }
        }

        if (output && output.executive_summary) {
            console.log(`\n📝 RESUMEN: ${output.executive_summary}`);
        }
      }

      // Verificar si el grafo está esperando aprobación (Interrupt)
      const state = await graph.getState(config);

      if (state.next && state.next.length > 0) {
        console.log(`\n⚠️  INTERRUPCIÓN DETECTADA EN: ${state.next.join(", ")}`);
        console.log("🤖 AUTO-APROBANDO TRANSICIÓN (SIMULANDO HUMANO)...");

        // Simplemente volvemos a correr el stream con null para continuar desde el checkpoint
        currentInput = null;
      } else {
        finished = true;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ CICLO DE AUTONOMÍA COMPLETADO");
    console.log("=".repeat(60));

  } catch (error) {
    console.error("\n❌ FALLO EN EL TEST:", error);
  }
}

runFullAutonomyTest();
