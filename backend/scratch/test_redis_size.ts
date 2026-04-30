import { MsgpackSerializer } from "../src/graph/serializers/MsgpackSerializer.js";
import { getRedisConnection } from "../src/db/redis.js";
import { AgentAnnotation } from "../src/graph/state.js";

async function run() {
    const serializer = new MsgpackSerializer();
    const redis = getRedisConnection();
    
    const largeState = {
        messages: Array(50).fill(0).map((_, i) => ({
            content: "Lorem ipsum dolor sit amet. ".repeat(20),
            type: i % 2 === 0 ? "human" : "ai",
            additional_kwargs: {
                tool_calls: i % 5 === 0 ? [{ id: "call_" + i, function: { name: "test", arguments: "{}" } }] : [],
                usage: { prompt_tokens: 100, completion_tokens: 200 }
            },
            id: "msg_" + i
        })),
        iteration_count: 100,
        total_cost_usd: 1.23456789,
        project_context: {
            id: "proj_123",
            config: {
                max_tokens: 50000,
                temperature: 0.7,
                top_p: 1.0,
                presence_penalty: 0.0,
                frequency_penalty: 0.0
            }
        },
        binary_blob: new Uint8Array(1024).fill(255)
    };

    console.log("--- Performance Audit: Serializer Comparison ---");
    
    // JSON
    const jsonStart = Date.now();
    const jsonStr = JSON.stringify(largeState);
    const jsonEnd = Date.now();
    const jsonSize = Buffer.byteLength(jsonStr);
    
    // Msgpack
    const msgpackStart = Date.now();
    const [type, bytes] = await serializer.dumpsTyped(largeState);
    const msgpackEnd = Date.now();
    const msgpackSize = bytes.length;

    console.log(`JSON Size: ${jsonSize} bytes`);
    console.log(`Msgpack Size: ${msgpackSize} bytes`);
    console.log(`Reduction: ${((1 - msgpackSize / jsonSize) * 100).toFixed(2)}%`);
    
    console.log(`JSON Time: ${jsonEnd - jsonStart}ms`);
    console.log(`Msgpack Time: ${msgpackEnd - msgpackStart}ms`);

    // Test persistence
    await redis.set("test:perf:json", jsonStr);
    await redis.set("test:perf:msgpack", Buffer.from(bytes));
    
    const redisJsonSize = await redis.memory("USAGE", "test:perf:json");
    const redisMsgpackSize = await redis.memory("USAGE", "test:perf:msgpack");
    
    console.log(`\nRedis Memory Usage (JSON): ${redisJsonSize} bytes`);
    console.log(`Redis Memory Usage (Msgpack): ${redisMsgpackSize} bytes`);
    
    process.exit(0);
}

run().catch(console.error);
