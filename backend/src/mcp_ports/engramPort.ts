import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { EngramToolArgs, EngramResult } from "@/types/engram.types.js";
import { SacredLogger } from "@/helpers/logger.js";

/**
 * EngramPort: Adaptador para la comunicación con el servidor MCP de Engram.
 * Proporciona una interfaz limpia y resiliente para la persistencia de memoria.
 */
export class EngramPort {
  private static readonly DEFAULT_URL = "http://localhost:3001";
  private static readonly TIMEOUT_MS = 5000;
  private static readonly CONTEXT = "ENGRAM_PORT";

  /**
   * Persiste una observación en el sistema Engram.
   * Implementa graceful degradation: si el servidor falla, el sistema continúa.
   */
  static async save(args: EngramToolArgs): Promise<EngramResult> {
    const serverUrl = process.env.ENGRAM_MCP_URL || this.DEFAULT_URL;
    
    // Si no hay URL configurada y estamos en un entorno donde no esperamos Engram,
    // podríamos saltar la ejecución, pero seguimos el RF-2.2 (intentar y fallar controlado).
    
    const transport = new StreamableHTTPClientTransport(new URL(serverUrl));
    const client = new Client(
      { name: "startup-autonoma-backend", version: "1.0.0" },
      { capabilities: {} }
    );

    let timeoutId: NodeJS.Timeout | undefined;
    try {
      // 1. Conexión con timeout
      const connectionPromise = client.connect(transport);
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error("Timeout conectando con el servidor MCP de Engram"));
        }, this.TIMEOUT_MS);
      });

      await Promise.race([connectionPromise, timeoutPromise]);

      // 2. Llamada a la herramienta mem_save
      const result = await client.callTool({
        name: "mem_save",
        arguments: {
          title: args.title,
          type: args.type,
          topic_key: args.topic_key,
          content: `**What**: ${args.content.What}\n**Why**: ${args.content.Why}\n**Data**: ${JSON.stringify(args.content.Data || {})}`
        }
      });

      SacredLogger.success(`Memoria persistida: ${args.title}`, this.CONTEXT);

      const callResult = result as { content: Array<{ type: string, text: string }> };
      const firstTextBlock = callResult.content.find((b) => b.type === "text");
      
      return {
        success: true,
        message: "Memoria guardada exitosamente en Engram",
        id: firstTextBlock?.text || `mem-${Date.now()}`
      };

    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      SacredLogger.warn(`No se pudo persistir en Engram: ${errorMsg}`, this.CONTEXT);
      
      return {
        success: false,
        message: `Fallo de persistencia (MCP_UNAVAILABLE): ${errorMsg}`,
        id: `failed-${Date.now()}`
      };
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      try {
        await client.close();
      } catch {
        // Ignoramos errores al cerrar
      }
    }
  }
}
