import { AgentStateType } from "@/types/state.types.js";
import { LLMService } from "@/services/llmService.js";
import { SystemMessage, AIMessage } from "@langchain/core/messages";
import { TelemetryService } from "@/services/telemetryService.js";
import { AuditService } from "@/services/auditService.js";
import { SecurityWorkerSchema } from "@/contracts/security_worker.js";

/**
 * SecurityWorker: El Guardián de la Ciberseguridad.
 * Analiza el código propuesto en busca de vulnerabilidades y riesgos.
 */
export async function security_worker_node(state: AgentStateType): Promise<Partial<AgentStateType>> {
  console.log("\n--- EJECUTANDO NODO SECURITY WORKER ---");

  const system_prompt = new SystemMessage(`
    Eres un experto en Ciberseguridad y Hacker Ético.
    Tu misión es auditar el código generado por otros agentes para prevenir brechas de seguridad.
    
    TUS OBJETIVOS:
    - Detectar Secretos Expuestos: Keys, Passwords, Tokens.
    - Detectar Inyecciones: SQL Injection, NoSQL Injection, Command Injection.
    - Detectar XSS y CSRF: Vulnerabilidades en el frontend.
    - Detectar Malas Prácticas: Uso de librerías obsoletas o configuraciones inseguras.

    REGLA DE BLOQUEO:
    Si encuentras una vulnerabilidad de severidad 'high' o 'critical', SIEMPRE pon 'should_block: true'.
  `);

  try {
    const { data: response, usage, cost, latency } = await LLMService.getStructuredData(
      { type: "smart", temperature: 0 },
      [system_prompt, ...state.messages],
      SecurityWorkerSchema
    );

    const projectId = state.project_context?.projectId || "unknown";

    // 1. Telemetría
    await TelemetryService.recordMetric(projectId, {
      node: "Security Worker",
      model: "gpt-4o",
      latency,
      usage
    });

    // 2. Auditoría
    await AuditService.logDecision(projectId, {
      agent: "Security Worker",
      decision: response.status,
      reasoning: response.reasoning,
      metadata: {
        vulnerabilities: response.vulnerabilities,
        should_block: response.should_block
      }
    });

    console.log(`🛡️ Security Audit: ${response.status} -> ${response.reasoning}`);

    const updates: Partial<AgentStateType> = {
      executive_summary: response.reasoning,
      reasoning: response.reasoning,
      iteration_count: 1,
      token_usage: usage,
      total_cost_usd: cost,
      messages: state.messages.concat([new AIMessage({
        content: `[SECURITY_WORKER_RESULT] Status: ${response.status}
Reasoning: ${response.reasoning}
Block Flow: ${response.should_block ? "YES" : "NO"}
Vulnerabilities Found: ${response.vulnerabilities.length}`,
      })])
    };

    return updates;
  } catch (error) {
    console.error("❌ Error en el Nodo Security Worker:", error);
    return {
      executive_summary: "Error crítico en el proceso de auditoría de seguridad.",
    };
  }
}
