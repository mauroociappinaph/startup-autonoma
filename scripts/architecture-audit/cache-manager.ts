import fs from "fs";
import path from "path";
import crypto from "crypto";
import { Violation } from "./types.js";

interface CacheEntry {
  hash: string;
  violations: Violation[];
}

interface CacheSchema {
  [filePath: string]: CacheEntry;
}

const CACHE_FILE = path.join(process.cwd(), ".architecture-cache.json");

export class CacheManager {
  private cache: CacheSchema = {};

  constructor() {
    this.load();
  }

  private load() {
    if (fs.existsSync(CACHE_FILE)) {
      try {
        this.cache = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
      } catch (e) {
        console.warn("⚠️  No se pudo cargar el cache de arquitectura. Iniciando vacío.");
        this.cache = {};
      }
    }
  }

  public save() {
    try {
      fs.writeFileSync(CACHE_FILE, JSON.stringify(this.cache, null, 2));
    } catch (e) {
      console.warn("⚠️  No se pudo guardar el cache de arquitectura.");
    }
  }

  public getFileHash(content: string): string {
    return crypto.createHash("md5").update(content).digest("hex");
  }

  public getValidEntry(filePath: string, currentContent: string): Violation[] | null {
    const entry = this.cache[filePath];
    if (!entry) return null;

    const currentHash = this.getFileHash(currentContent);
    if (entry.hash === currentHash) {
      return entry.violations;
    }

    return null;
  }

  public updateEntry(filePath: string, content: string, violations: Violation[]) {
    this.cache[filePath] = {
      hash: this.getFileHash(content),
      violations,
    };
  }
}
