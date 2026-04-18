import { write_file, patch_file } from "@/tools/fs.js";
import fs from "fs/promises";
import path from "path";

// Mock de fs/promises para aislar tests del FileSystem real
jest.mock("fs/promises", () => ({
  mkdir: jest.fn(),
  writeFile: jest.fn(),
  readFile: jest.fn(),
}));

describe("CodeWriter Tools (fs.ts)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("write_file", () => {
    it("debe crear o sobreescribir el archivo exitosamente", async () => {
      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const result = await write_file.invoke({
        file_path: "test/example.ts",
        content: "const a = 1;"
      });

      expect(fs.mkdir).toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalled();
      expect(result).toContain("exitosamente");
    });
  });

  describe("patch_file", () => {
    it("debe reemplazar el contenido si encuentra target_content exacto", async () => {
      (fs.readFile as jest.Mock).mockResolvedValue("const a = 1;\nconst b = 2;");
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const result = await patch_file.invoke({
        file_path: "test/example.ts",
        target_content: "const a = 1;",
        replacement_content: "const a = 10;"
      });

      expect(fs.readFile).toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.any(String),
        "const a = 10;\nconst b = 2;",
        "utf-8"
      );
      expect(result).toContain("exitosamente");
    });

    it("debe arrojar error si el target_content no existe", async () => {
      (fs.readFile as jest.Mock).mockResolvedValue("const a = 1;");

      const result = await patch_file.invoke({
        file_path: "test/example.ts",
        target_content: "const z = 99;",
        replacement_content: "const a = 10;"
      }) as { error: string };

      expect(fs.writeFile).not.toHaveBeenCalled();
      expect(result.error).toContain("No se encontró coincidencia exacta");
    });
  });
});
