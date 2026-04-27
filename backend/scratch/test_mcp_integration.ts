import { defaultRegistry } from "../src/mcp_ports/index.js";
import { SacredLogger } from "../src/helpers/logger.js";
import * as dotenv from "dotenv";

dotenv.config();

async function testIntegration() {
  console.log("\n--- 🧪 TEST DE INTEGRACIÓN MCP & REGISTRY ---\n");

  // 1. Probar Discovery
  console.log("1. Probando Discovery de Herramientas...");
  const allTools = defaultRegistry.listTools();
  console.log(`✅ Se encontraron ${allTools.length} herramientas registradas.`);
  
  const fsTools = defaultRegistry.getToolsByCategory("filesystem");
  console.log(`✅ Categoría 'filesystem' tiene ${fsTools.length} herramientas.`);

  // 2. Probar obtención e invocación de una tool real (read_file)
  console.log("\n2. Probando invocación vía Registry (read_file)...");
  try {
    const readFileTool = defaultRegistry.getTool("read_file");
    const result = await readFileTool.invoke({ file_path: "package.json" });
    if (typeof result === "string" && result.includes("\"name\": \"startup-autonoma\"")) {
      console.log("✅ Invocación de tool vía Registry: EXITOSA");
    } else {
      console.error("❌ El resultado de read_file no es el esperado (probablemente leyó el package.json equivocado o falló).");
    }
  } catch (error) {
    console.error("❌ Falló la invocación vía Registry:", error);
  }

  // 3. Probar Engram Port (Conexión Real / Graceful Degradation)
  console.log("\n3. Probando Engram Port (Persistencia)...");
  console.log("   (Aviso: Si no hay un servidor MCP en 3001, esperamos un timeout controlado en 5s)");
  
  const engramTool = defaultRegistry.getTool("save_to_engram");
  const startTime = Date.now();
  
  const engramResult = await engramTool.invoke({
    title: "Test de Integración SDD",
    type: "discovery",
    topic_key: "system/tests",
    content: {
      What: "Probando el nuevo EngramPort",
      Why: "Verificar que el timeout y el logging funcionan"
    }
  });

  const duration = (Date.now() - startTime) / 1000;
  console.log(`\n⏱️  La operación tomó ${duration.toFixed(2)} segundos.`);
  
  if (engramResult.success) {
    console.log("🚀 ¡INCREÍBLE! El servidor MCP estaba arriba y guardó la memoria.");
  } else {
    console.log("⚠️  Comportamiento Esperado: El Port detectó que el servidor no está y falló con elegancia.");
    console.log("   Resultado interno:", JSON.stringify(engramResult, null, 2));
  }
}

testIntegration().catch(err => {
  console.error("❌ Error fatal en el test de integración:", err);
  process.exit(1);
});
