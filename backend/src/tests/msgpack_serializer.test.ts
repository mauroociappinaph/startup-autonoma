import { MsgpackSerializer } from "../graph/serializers/MsgpackSerializer.js";
import { describe, it, expect } from "@jest/globals";

describe("MsgpackSerializer", () => {
  const serializer = new MsgpackSerializer();

  it("should encode and decode an object correctly", async () => {
    const data = { 
      thread_id: "test", 
      messages: [{ content: "hello", type: "human" }],
      iteration_count: 5 
    };

    const [type, bytes] = await serializer.dumpsTyped(data);
    expect(type).toBe("msgpack");
    expect(bytes).toBeInstanceOf(Uint8Array);

    const decoded = await serializer.loadsTyped(type, bytes);
    expect(decoded).toEqual(data);
  });

  it("should handle JSON fallback during migration", async () => {
    const data = { legacy: true };
    const jsonStr = JSON.stringify(data);
    
    const decoded = await serializer.loadsTyped("json", jsonStr);
    expect(decoded).toEqual(data);
  });

  it("should throw error for unknown format", async () => {
    await expect(serializer.loadsTyped("xml", "<root></root>"))
      .rejects.toThrow("Serializer desconocido: xml");
  });
});
