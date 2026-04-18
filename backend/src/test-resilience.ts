import { GraphService } from './services/graphService.js';
import { EventBus } from './services/eventBus.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Script de demostración para el flujo de Resiliencia (History & Rewind).
 * 
 * Flujo:
 * 1. Simular una ejecución inicial que genera checkpoints.
 * 2. Recuperar la lista de checkpoints (History).
 * 3. Retroceder en el tiempo (Rewind) a un punto anterior.
 * 4. Verificar que el estado se haya restaurado.
 */
async function demoResilience() {
  const threadId = `demo-${uuidv4().substring(0, 8)}`;
  console.log(`🚀 Iniciando RUN de prueba en thread: ${threadId}`);

  // 1. Ejecutar el grafo (esto llegará hasta el interrupt de aprobación)
  const stream = GraphService.runAgentStream(
    "Hola, necesito que analices la arquitectura del login y me propongas una mejora de seguridad.",
    threadId
  );

  console.log("⏳ Generando estrategia inicial...");
  for await (const event of stream) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const streamEvent = event as any;
    if (streamEvent.isWaiting) {
      console.log(`✅ Grafo pausado en: ${streamEvent.activeNode}`);
      console.log(`📝 Resumen: ${streamEvent.executiveSummary}`);
      break;
    }
  }

  // 2. Obtener historial de checkpoints
  console.log("\n📜 Solicitando historial de checkpoints...");
  const history = await GraphService.getHistory(threadId);
  console.log(`📦 Encontrados ${history.length} checkpoints.`);

  history.forEach((h, i) => {
    console.log(`   [${i}] ID: ${h.id.substring(0, 8)} | Next: ${h.next}`);
  });

  if (history.length < 2) {
    console.log("❌ No hay suficiente historial para el rewind.");
    process.exit(1);
  }

  // 3. Hacer Rewind al estado inicial (el primer checkpoint generado)
  // Nota: El historial suele venir del más reciente al más antiguo.
  const oldCheckpoint = history[history.length - 1]; 
  console.log(`\n⏪ Haciendo REWIND al checkpoint: ${oldCheckpoint.id.substring(0, 8)} (Estado inicial)`);
  
  await GraphService.rewind(threadId, oldCheckpoint.id);
  console.log("✅ Rewind completado con éxito.");

  // 4. Verificar el estado actual
  const newHistory = await GraphService.getHistory(threadId);
  const currentState = newHistory[0];
  console.log(`\n🕵️ Verificando estado actual post-rewind:`);
  console.log(`   ID Actual: ${currentState.id.substring(0, 8)}`);
  console.log(`   Siguiente Nodo: ${currentState.next}`);
  
  if (currentState.next.includes('ceo')) {
    console.log("\n🎉 ¡ÉXITO! El sistema volvió al punto de partida listo para re-ejecutar.");
  } else {
    console.log("\n⚠️ El estado no es exactamente el esperado, revisa la lógica de checkpoints.");
  }

  process.exit(0);
}

demoResilience().catch(console.error);
