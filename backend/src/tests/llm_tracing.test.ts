import { describe, it, expect, jest, beforeAll } from '@jest/globals';
import * as opentelemetry from "@opentelemetry/api";
import { AsyncHooksContextManager } from "@opentelemetry/context-async-hooks";
import { z } from "zod";

// Mocking LangChain and Telemetry to avoid real calls
jest.mock("../services/llmFactory.js");
jest.mock("../services/telemetryService.js");

describe("LLMService Tracing", () => {
  let LLMService: any;
  let TelemetryService: any;

  beforeAll(async () => {
    // Setup Context Manager
    const contextManager = new AsyncHooksContextManager();
    contextManager.enable();
    opentelemetry.context.setGlobalContextManager(contextManager);

    const telemetryModule = await import("../services/telemetryService.js");
    TelemetryService = telemetryModule.TelemetryService;
    
    // Mock getTracer to return a real tracer for testing
    (TelemetryService as any).getTracer = jest.fn().mockReturnValue(opentelemetry.trace.getTracer("test-llm"));

    const llmModule = await import("../services/llmService.js");
    LLMService = llmModule.LLMService;
  });

  it("debe crear un span cuando se llama a getStructuredData", async () => {
    // Mocking the internal call to avoid execution
    (LLMService as any)._getManualStructuredData = jest.fn().mockImplementation(() => Promise.resolve({
      data: { success: true },
      usage: { total: 10, prompt: 5, completion: 5 }
    }));

    const tracer = TelemetryService.getTracer();
    const startActiveSpanSpy = jest.spyOn(tracer, "startActiveSpan");

    await LLMService.getStructuredData(
      { type: "ultra" },
      [{ content: "hola", _getType: () => "human" }],
      z.object({ success: z.boolean() })
    ).catch(() => {}); 

    expect(startActiveSpanSpy).toHaveBeenCalledWith(
      expect.stringContaining("LLM_GENERATE"),
      expect.any(Function)
    );
  });
});
