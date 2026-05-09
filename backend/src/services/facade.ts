import { LLMService } from "./llmService.js";
import { telemetryService } from "./telemetryService.js";
import { AuditService } from "./auditService.js";
import { SacredLogger } from "../helpers/logger.js";
import { prisma } from "@startup/db";
import { EventBus } from "./eventBus.js";
import { aiEngineClient } from "./aiEngineClient.js";
import { projectService } from "./projectService.js";

/**
 * ServiceFacade: Central entry point for infrastructure services.
 */
export const services = {
  /**
   * High-level LLM interactions (structured and text).
   */
  llm: LLMService,

  /**
   * Advanced observability and metrics engine.
   */
  telemetry: telemetryService,

  /**
   * Strategic decision and action auditing.
   */
  audit: AuditService,

  /**
   * Structured logging system.
   */
  logger: SacredLogger,

  /**
   * Database access (Prisma singleton).
   */
  db: prisma,

  /**
   * Real-time event bus and pub/sub.
   */
  eventBus: EventBus,

  /**
   * AI-Engine gRPC client.
   */
  aiEngine: aiEngineClient,

  /**
   * Project lifecycle and isolation service.
   */
  project: projectService,
};

export type ServiceFacade = typeof services;
