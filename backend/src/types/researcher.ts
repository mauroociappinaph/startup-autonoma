/* eslint-disable */
import { z } from "zod";
import { ResearcherResponseSchema } from "../contracts/researcher.js";

/**
 * Tipo inferido de la respuesta del ResearchWorker.
 * Centralizado en /types según Ley Sagrada #9.
 */
export type ResearcherResponse = z.infer<typeof ResearcherResponseSchema>;
