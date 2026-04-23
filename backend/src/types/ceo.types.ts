import { z } from "zod";
import { CEOResponseSchema } from "@startup/shared";

/**
 * Tipo inferido de la respuesta del CEO.
 * Cumple con la Ley #7 (Centralización de Tipos).
 */
export type CEOResponse = z.infer<typeof CEOResponseSchema>;
