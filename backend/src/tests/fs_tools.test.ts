/* eslint-disable @typescript-eslint/no-explicit-any */

import { write_file, patch_file } from "@/tools/fs.js";
import fs from "fs/promises";
import { jest, describe, beforeEach, it, expect } from '@jest/globals';

// Mockeamos ioredis para evitar conexiones reales
jest.mock('ioredis', () => {
  const MockRedis = jest.fn().mockImplementation(() => ({
    pipeline: (jest.fn() as any).mockImplementation(() => ({ rpush: (jest.fn() as any).mockReturnThis(), ltrim: (jest.fn() as any).mockReturnThis(), expire: (jest.fn() as any).mockReturnThis(), hincrbyfloat: (jest.fn() as any).mockReturnThis(), hincrby: (jest.fn() as any).mockReturnThis(), exec: (jest.fn() as any).mockResolvedValue([]) })),
    hincrbyfloat: (jest.fn() as any).mockReturnThis(),
    hincrby: (jest.fn() as any).mockReturnThis(),
    rpush: (jest.fn() as any).mockReturnThis(),
    ltrim: (jest.fn() as any).mockReturnThis(),
    expire: (jest.fn() as any).mockReturnThis(),
    lrange: (jest.fn() as any).mockResolvedValue([]),
    exec: (jest.fn() as any).mockResolvedValue([]),
    hgetall: (jest.fn() as any).mockResolvedValue({}),
    set: (jest.fn() as any).mockResolvedValue("OK"),
    get: (jest.fn() as any).mockResolvedValue(null),
    on: jest.fn() as any,
    quit: (jest.fn() as any).mockResolvedValue("OK")
  }));
  return {
    Redis: MockRedis,
    default: MockRedis
  };
});

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
