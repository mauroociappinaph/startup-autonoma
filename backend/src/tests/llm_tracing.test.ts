import { jest, describe, it, expect, beforeAll } from '@jest/globals';
import * as opentelemetry from "@opentelemetry/api";
import { AsyncHooksContextManager } from "@opentelemetry/context-async-hooks";
import { z } from "zod";
import { TelemetryService } from "../services/telemetryService.js";
import { LLMService } from "../services/llmService.js";
import { RetryStrategy } from "../services/llm/retryStrategy.js";
import { HumanMessage } from "@langchain/core/messages";

// Mocking to avoid real calls
jest.mock("../services/llmFactory.js");

describe("LLMService Tracing", () => {
  beforeAll(async () => {
    // Setup Context Manager
    const contextManager = new AsyncHooksContextManager();
    contextManager.enable();
    opentelemetry.context.setGlobalContextManager(contextManager);
    
    // Mock getTracer to return a real tracer for testing
    jest.spyOn(TelemetryService as unknown as { getTracer: () => opentelemetry.Tracer }, "getTracer").mockReturnValue(opentelemetry.trace.getTracer("test-llm"));
  });

  it("debe crear un span cuando se llama a getStructuredData", async () => {
    // Mocking the internal call to avoid execution
    const retrySpy = jest.spyOn(RetryStrategy, "executeWithStructuredRetry").mockResolvedValue({
      data: { success: true },
      usage: { total: 10, prompt: 5, completion: 5 },
      model: "test-model"
    });

    const tracer = TelemetryService.getTracer();
    const startActiveSpanSpy = jest.spyOn(tracer, "startActiveSpan");

    await LLMService.getStructuredData(
      { type: "ultra" },
      [new HumanMessage("hola")],
      z.object({ success: z.boolean() })
    );

    expect(startActiveSpanSpy).toHaveBeenCalledWith(
      expect.stringContaining("LLM_GENERATE"),
      expect.any(Function)
    );
    expect(retrySpy).toHaveBeenCalled();
  });
});
