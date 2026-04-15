/**
 * Definición de tipos para la comunicación con el sistema de memoria Engram.
 */

export interface EngramToolArgs {
  title: string;
  type: "bugfix" | "decision" | "architecture" | "discovery" | "pattern" | "config" | "preference" | "lead";
  topic_key: string;
  content: {
    What: string;
    Why: string;
    Data?: any; 
  };
}

export interface EngramResult {
  success: boolean;
  message: string;
  id: string;
}
