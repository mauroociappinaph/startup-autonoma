import { ProtocolHelper } from "../helpers/protocol_helper.js";
import { AIMessage } from "@langchain/core/messages";
import { WorkerInstruction, WorkerResult } from "@startup/shared";

describe("Worker Connectivity Protocol (#182)", () => {
  const mockInstruction: WorkerInstruction = {
    action: "test_action",
    payload: { key: "value" },
    reasoning: "Unit testing the protocol"
  };

  const mockResult: WorkerResult = {
    status: "success",
    payload: { data: "ok" },
    reasoning: "Operation completed"
  };

  test("ProtocolHelper.packInstruction & getInstruction should be symmetric", () => {
    const packed = ProtocolHelper.packInstruction(mockInstruction);
    const message = new AIMessage({
      content: "Test",
      additional_kwargs: packed
    });

    const extracted = ProtocolHelper.getInstruction([message]);
    expect(extracted).toEqual(mockInstruction);
  });

  test("ProtocolHelper.packResult & getResult should be symmetric", () => {
    const packed = ProtocolHelper.packResult(mockResult);
    const message = new AIMessage({
      content: "Test Result",
      additional_kwargs: packed
    });

    const extracted = ProtocolHelper.getResult([message]);
    expect(extracted).toEqual(mockResult);
  });

  test("getInstruction should find the LAST instruction in history", () => {
    const oldInstruction: WorkerInstruction = { ...mockInstruction, action: "old" };
    const newInstruction: WorkerInstruction = { ...mockInstruction, action: "new" };

    const messages = [
      new AIMessage({ content: "1", additional_kwargs: ProtocolHelper.packInstruction(oldInstruction) }),
      new AIMessage({ content: "2", additional_kwargs: ProtocolHelper.packInstruction(newInstruction) })
    ];

    const extracted = ProtocolHelper.getInstruction(messages);
    expect(extracted?.action).toBe("new");
  });

  test("should return null for malformed instructions", () => {
    const message = new AIMessage({
      content: "Bad",
      additional_kwargs: { worker_instruction: { action: 123 } } // Invalid type
    });

    const extracted = ProtocolHelper.getInstruction([message]);
    expect(extracted).toBeNull();
  });
});
