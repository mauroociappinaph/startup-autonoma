import { BaseMessage } from "@langchain/core/messages";
import { ProjectContext } from "./Project.types.js";

/**
 * Interfaz pura del estado de los agentes.
 * Cumple con la Ley #7 (Centralización de Tipos).
 */
export interface AgentStateType {
  project_context?: ProjectContext; // Aislamiento de startup (Gap 2) - Opcional para compatibilidad con tests

  original_prompt: string; // El input crudo del humano
  refined_prompt: string;  // El input optimizado por el Mirror
  messages: BaseMessage[];
  trace_id?: string; // Identificador de traza para observabilidad
  reasoning?: string; // Justificación del paso actual
  executive_summary: string;
  iteration_count: number; // Contador de pasos en el grafo
  token_usage: {
    total: number;
    prompt: number;
    completion: number;
  };
  total_cost_usd?: number; // Nuevo campo para telemetría (Gap 6)
  max_budget_reached?: boolean; // Flag de emergencia del Circuit Breaker
  retry_count: number;
  plan: string[]; // Tareas pendientes o totales
  completed_steps: string[]; // Tareas finalizadas
  active_chief?: string; // Añadido para el nodo activo del Chief
  /**
   * Registro de la última sincronización con el BudgetService.
   */
  last_recorded_tokens?: number;
  next_node?: string; // Nodo al que el Circuit Breaker debería redirigir si todo está OK
  is_mission_approved?: boolean; // Flag para evitar bucles de aprobación
  is_malicious?: boolean; // Detectado por AduanaSentinel
  threat_level?: "none" | "low" | "medium" | "high" | "critical"; // Nivel de amenaza detectado
  security_report?: string; // Reporte detallado del Sentinel
  last_diagram?: string; // Contenido del último diagrama Mermaid generado

  // --- Domain Segregation (Issue #185) ---
  business?: BusinessContext;
  software?: SoftwareContext;
  operations?: OperationsContext;

  [key: string]: unknown; // Firma de índice requerida por LangGraph (tipado seguro)
}

/**
 * Contexto específico del dominio de Negocios.
 */
export interface BusinessContext {
  lead_gen_payload?: {
    niche: string;
    location?: string;
    limit: number;
  };
  qualified_leads?: any[];
  market_research?: string;
  strategic_clarification?: string;
}

/**
 * Contexto específico del dominio de Software.
 */
export interface SoftwareContext {
  last_impact_analysis?: any;
  affected_files?: string[];
  technical_plan?: string[];
  test_report?: string;
}

/**
 * Contexto específico del dominio de Operaciones.
 */
export interface OperationsContext {
  infrastructure_report?: string;
  security_audit_logs?: string[];
  deployment_status?: "pending" | "success" | "failed";
}
