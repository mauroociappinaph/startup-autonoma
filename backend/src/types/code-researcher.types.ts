import { z } from "zod";

/**
 * Esquema para las acciones del Code Researcher.
 */
export const CodeResearcherActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("list_files"),
    path: z.string().optional().describe("Ruta relativa para listar (default: root)"),
    recursive: z.boolean().optional().default(true).describe("Si debe listar recursivamente")
  }),
  z.object({
    action: z.literal("read_file"),
    path: z.string().describe("Ruta relativa del archivo a leer")
  }),
  z.object({
    action: z.literal("search_pattern"),
    pattern: z.string().describe("Patrón a buscar (regex)"),
    path: z.string().optional().describe("Ruta donde buscar"),
    include: z.array(z.string()).optional().describe("Glob patterns para incluir")
  })
]);

export const CodeResearcherInputSchema = z.object({
  payload: CodeResearcherActionSchema,
  rootPath: z.string().optional().describe("Path raíz del proyecto (opcional)")
});

export type CodeResearcherInput = z.infer<typeof CodeResearcherInputSchema>;

export interface CodeResearcherResponse {
  success: boolean;
  action: string;
  data?: any;
  errorMessage?: string;
}
