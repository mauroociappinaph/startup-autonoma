/* eslint-disable */
/* eslint-disable */
import { list_dir, read_file } from "./fs.js";

/**
 * Registro central de herramientas del sistema.
 * Agrupa todas las capacidades de interacción con el entorno.
 */
export const systemTools = [list_dir, read_file];

// Exportaciones individuales por si se necesitan por separado
export { list_dir, read_file };
