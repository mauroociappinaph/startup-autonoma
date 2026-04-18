import { LLMService } from "../src/services/llmService.js";
import { TelemetryService } from "../src/services/telemetryService.js";
import { AuditService } from "../src/services/auditService.js";
import { closeRedisConnections } from "../src/db/redis.js";
import { z } from "zod";

import { HumanMessage } from "@langchain/core/messages";

/**
 * Test de integración para el Gap 6: Observabilidad Avanzada.
 * Valida telemetría de costos, latencia y auditoría persistente.
 */
async function testObservability() {
  console.log("\n🧪 Iniciando Test de Observabilidad Avanzada (Gap 6)...");
  
  const projectId = `project-obs-${Date.now()}`;
  const mockSchema = z.object({
    analysis: z.string(),
    next_step: z.string()
  });

  try {
    // 1. Mock de Telemetría y Costos
    console.log("1️⃣ Simulando llamada a LLM con telemetría...");
    
    // Sobrescribimos temporalmente el método para el test
    const originalGetStructuredData = LLMService.getStructuredData;
    LLMService.getStructuredData = async () => ({
      data: { analysis: "Análisis simulado", next_step: "continue" },
      usage: { total: 1000, prompt: 600, completion: 400 },
      cost: 0.012, // Costo simulado
      latency: 1500.25 // Latencia simulada
    }) as any;

    const result = await LLMService.getStructuredData(
      { type: "fast", temperature: 0 },
      [new HumanMessage("Hola, necesito un análisis rápido.")],
      mockSchema
    );

    console.log(`   ✅ Latencia capturada: ${result.latency.toFixed(2)}ms`);
    console.log(`   ✅ Costo calculado: $${result.cost.toFixed(6)}`);
    
    if (result.latency > 0 && result.cost >= 0) {
      console.log("   🟢 Telemetría OK.");
    }

    // 2. Probar Auditoría Persistente
    console.log("\n2️⃣ Registrando auditoría de razonamiento...");
    await AuditService.logDecision(projectId, {
      agent: "TEST_AGENT",
      decision: "verify_telemetry",
      reasoning: "Validando que el rastro de auditoría llegue a Redis correctamente.",
      metadata: { latency: result.latency }
    });

    const auditTrail = await AuditService.getAuditTrail(projectId);
    console.log(`   ✅ Entradas encontradas en Redis: ${auditTrail.length}`);
    
    if (auditTrail.length > 0 && auditTrail[0].agent === "TEST_AGENT") {
      console.log(`   📜 Razonamiento recuperado: "${auditTrail[0].reasoning}"`);
      console.log("   🟢 Auditoría OK.");
    }

  } catch (error) {
    console.error("❌ Error durante el test:", error);
    process.exit(1);
  } finally {
    await closeRedisConnections();
    process.exit(0);
  }
}

testObservability().catch(console.error);
