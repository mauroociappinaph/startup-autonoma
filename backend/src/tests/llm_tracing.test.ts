import { describe, it, expect, jest, beforeAll } from '@jest/globals';
import * as opentelemetry from "@opentelemetry/api";
import { AsyncHooksContextManager } from "@opentelemetry/context-async-hooks";
import { z } from "zod";
import { TelemetryService } from "../services/telemetryService.js";
import { LLMService } from "../services/llmService.js";
import { HumanMessage } from "@langchain/core/messages";

// Mocking LangChain and Telemetry to avoid real calls
jest.mock("../services/llmFactory.js");
jest.mock("../services/telemetryService.js");

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
    jest.spyOn(LLMService as unknown as { _getManualStructuredData: () => Promise<unknown> }, "_getManualStructuredData").mockResolvedValue({
      data: { success: true },
      usage: { total: 10, prompt: 5, completion: 5 }
    });

    const tracer = TelemetryService.getTracer();
    const startActiveSpanSpy = jest.spyOn(tracer, "startActiveSpan");

    await LLMService.getStructuredData(
      { type: "ultra" },
      [new HumanMessage("hola")],
      z.object({ success: z.boolean() })
    ).catch(() => {}); 

    expect(startActiveSpanSpy).toHaveBeenCalledWith(
      expect.stringContaining("LLM_GENERATE"),
      expect.any(Function)
    );
  });
});
