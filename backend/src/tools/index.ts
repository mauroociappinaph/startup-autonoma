import { list_dir, read_file } from "./fs.js";
import { test_runner } from "./domain/software/testRunner.js";

/**
 * Registro central de herramientas del sistema.
 * Agrupa todas las capacidades de interacción con el entorno.
 */
export const systemTools = [list_dir, read_file, test_runner];

// Exportaciones individuales por si se necesitan por separado
export { list_dir, read_file, test_runner };
