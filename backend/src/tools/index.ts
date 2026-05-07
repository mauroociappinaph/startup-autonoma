import { list_dir, read_file, write_file, patch_file } from "./fs.js";
import { test_runner } from "./domain/software/testRunner.js";
import { save_to_engram } from "./platform/engram_tool.js";
import { sequential_thinking } from "./platform/sequential_thinking_tool.js";
import { terminal_tool } from "./platform/terminal_tool.js";

/**
 * Registro central de herramientas del sistema.
 * Agrupa todas las capacidades de interacción con el entorno.
 */
export const systemTools = [
  list_dir, 
  read_file, 
  write_file, 
  patch_file, 
  test_runner, 
  save_to_engram,
  sequential_thinking,
  terminal_tool
];

// Exportaciones individuales por si se necesitan por separado
export { 
  list_dir, 
  read_file, 
  write_file, 
  patch_file, 
  test_runner, 
  save_to_engram,
  sequential_thinking,
  terminal_tool
};
