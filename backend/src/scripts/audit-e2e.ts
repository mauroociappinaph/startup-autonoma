import "dotenv/config";
import { getGraph } from "../graph/index.js";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { performance } from "perf_hooks";

import { AgentStateType } from "@startup/shared";
import { TelemetryEntry } from "../types/telemetry.js";

/**
 * STARTUP AUTÓNOMA: AUDITORÍA E2E CON TELEMETRÍA
 * Este script valida el flujo completo midiendo latencias por nodo.
 */
async function runAuditE2E() {
    const userPrompt = "Documentá brevemente la responsabilidad del CEO en /docs/agents/ceo_mission.md basándote en su código fuente.";
    const graph = await getGraph();
    const thread_id = `audit-e2e-${Date.now()}`;
    const config = { configurable: { thread_id } };

    console.log("\n" + "=".repeat(80));
    console.log("🛡️  AUDITORÍA DE SISTEMA - FLUJO E2E");
    console.log(`📝 MISIÓN: ${userPrompt}`);
    console.log("=".repeat(80) + "\n");

    const initialInput: Partial<AgentStateType> = {
        messages: [new HumanMessage(userPrompt)],
        original_prompt: userPrompt,
        trace_id: "audit-trace-" + Date.now(),
    };

    const telemetry: TelemetryEntry[] = [];
    const startTimeTotal = performance.now();

    try {
        let currentInput: Partial<AgentStateType> | null = initialInput;
        let finished = false;

        while (!finished) {
            const stream = await graph.stream(currentInput, config);
            
            for await (const step of stream) {
                const nodeStartTime = performance.now();
                const nodeName = Object.keys(step as object)[0];
                const output = (step as Record<string, Record<string, unknown>>)[nodeName];
                const nodeDuration = performance.now() - nodeStartTime;

                telemetry.push({
                    node: nodeName,
                    duration: nodeDuration,
                    timestamp: new Date().toISOString()
                });

                console.log(`\n[${new Date().toLocaleTimeString()}] >>> [NODO: ${nodeName.toUpperCase()}] (${nodeDuration.toFixed(2)}ms)`);
                
                if (output && typeof output.reasoning === "string") {
                    console.log("   └─ 🧠 RAZONAMIENTO: " + (output.reasoning.substring(0, 150).replace(/\n/g, ' ')) + "...");
                }

                if (output && typeof output.executive_summary === "string") {
                    console.log(`   └─ 📝 RESUMEN: ${output.executive_summary}`);
                }

                if (output && Array.isArray(output.messages)) {
                    const messages = output.messages as unknown[];
                    const lastMsg = messages[messages.length - 1];
                    if (lastMsg instanceof AIMessage) {
                        const content = typeof lastMsg.content === "string" ? lastMsg.content : JSON.stringify(lastMsg.content);
                        console.log(`   └─ 🤖 IA: ${content.substring(0, 100)}...`);
                    }
                }
            }

            const state = await graph.getState(config);
            
            if (state.next && state.next.length > 0) {
                console.log(`\n⏸️  HITL DETECTADO EN: ${state.next.join(", ")}`);
                console.log("   👉 AUTO-APROBANDO...");
                currentInput = null; 
            } else {
                finished = true;
            }
        }

        const totalDuration = performance.now() - startTimeTotal;
        console.log("\n" + "=".repeat(80));
        console.log("📊 INFORME DE LATENCIAS");
        console.log("-".repeat(80));
        telemetry.forEach(t => {
            console.log(`${t.node.padEnd(20)} | ${t.duration.toFixed(2)}ms`);
        });
        console.log("-".repeat(80));
        console.log(`TOTAL DURATION: ${(totalDuration / 1000).toFixed(2)}s`);
        console.log("=".repeat(80) + "\n");

    } catch (error) {
        console.error("\n❌ ERROR CRÍTICO DURANTE LA AUDITORÍA:", error);
    }
}

runAuditE2E();
