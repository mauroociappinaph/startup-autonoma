import { write_file, patch_file } from "@/tools/fs.js";
import fs from "fs/promises";
import { jest, describe, beforeEach, it, expect } from '@jest/globals';

describe("CodeWriter Tools (fs.ts)", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe("write_file", () => {
    it("debe crear o sobreescribir el archivo exitosamente", async () => {
      const mkdirSpy = jest.spyOn(fs, 'mkdir').mockResolvedValue(undefined);
      const writeSpy = jest.spyOn(fs, 'writeFile').mockResolvedValue(undefined);

      const result = await write_file.invoke({
        file_path: "test/example.ts",
        content: "const a = 1;"
      });

      expect(mkdirSpy).toHaveBeenCalled();
      expect(writeSpy).toHaveBeenCalled();
      expect(result).toContain("exitosamente");
    });
  });

  describe("patch_file", () => {
    it("debe reemplazar el contenido si encuentra target_content exacto", async () => {
      const readSpy = jest.spyOn(fs, 'readFile').mockResolvedValue("const a = 1;\nconst b = 2;");
      const writeSpy = jest.spyOn(fs, 'writeFile').mockResolvedValue(undefined);

      const result = await patch_file.invoke({
        file_path: "test/example.ts",
        target_content: "const a = 1;",
        replacement_content: "const a = 10;"
      });

      expect(readSpy).toHaveBeenCalled();
      expect(writeSpy).toHaveBeenCalledWith(
        expect.any(String),
        "const a = 10;\nconst b = 2;",
        "utf-8"
      );
      expect(result).toContain("exitosamente");
    });

    it("debe arrojar error si el target_content no existe", async () => {
      const readSpy = jest.spyOn(fs, 'readFile').mockResolvedValue("const a = 1;");
      const writeSpy = jest.spyOn(fs, 'writeFile').mockResolvedValue(undefined);

      const result = await patch_file.invoke({
        file_path: "test/example.ts",
        target_content: "const z = 99;",
        replacement_content: "const a = 10;"
      }) as { error: string };

      expect(writeSpy).not.toHaveBeenCalled();
      expect(result.error).toContain("No se encontró coincidencia exacta");
      expect(readSpy).toHaveBeenCalled();
    });
  });
});
