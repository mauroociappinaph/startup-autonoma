import { validatePath } from "../tools/fs.js";
import path from "path";
import { describe, it, expect } from '@jest/globals';

describe("Filesystem Root Validation", () => {
  it("debe resolver la raíz del proyecto correctamente", () => {
    const resolved = validatePath(".");
    
    // Si estamos en el monorepo 'Agentes Personales', la ruta resuelta
    // debería contener ese nombre y NO subir un nivel por encima de él.
    // El bug actual hace path.resolve(process.cwd(), "..") que sube de más si estamos en la raíz.
    
    const currentCwd = process.cwd();
    console.log(`DEBUG: CWD actual: ${currentCwd}`);
    console.log(`DEBUG: Ruta resuelta por validatePath('.'): ${resolved}`);
    
    // Si corremos los tests desde la raíz del monorepo (como lo hace turbo):
    // CWD = /.../Agentes Personales
    // PROJECT_ROOT actual = /.../Agentes Personales/.. = /.../
    // Esto es INCORRECTO.
    
    expect(resolved).toContain("Agentes Personales");
    expect(resolved.endsWith("Agentes Personales")).toBe(true);
  });
});
