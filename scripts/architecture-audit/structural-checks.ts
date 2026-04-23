import fs from "fs";
import path from "path";
import { Violation } from "./types.js";

export function checkBarrelFiles(): Violation[] {
  const results: Violation[] = [];
  const PACKAGES = ["backend/src", "frontend/src"];
  const REQUIRED_BARREL_DIRS = [
    "nodes", "types", "contracts", "state", "services", "jobs", "helpers", "controllers", "routes", "api", "hooks", "store"
  ];

  PACKAGES.forEach((pkg) => {
    const srcPath = path.join(process.cwd(), pkg);
    if (!fs.existsSync(srcPath)) return;

    REQUIRED_BARREL_DIRS.forEach((subDir) => {
      const dirPath = path.join(srcPath, subDir);
      if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
        const indexPath = path.join(dirPath, "index.ts");
        const indexJsxPath = path.join(dirPath, "index.tsx");
        if (!fs.existsSync(indexPath) && !fs.existsSync(indexJsxPath)) {
          results.push({
            filePath: `${pkg}/${subDir}`,
            line: 0,
            message: `🚨 [LEY #2 ROTA]: El directorio no tiene un index.ts (Barrel File obligatorio).`,
            severity: "error",
          });
        }
      }
    });
  });

  return results;
}

export function checkStructuralIntegrity(): Violation[] {
  const results: Violation[] = [];
  const PACKAGES = ["backend", "frontend"];
  
  PACKAGES.forEach((pkg) => {
    const tsconfigPath = path.join(process.cwd(), pkg, "tsconfig.json");
    if (!fs.existsSync(tsconfigPath)) {
      results.push({
        filePath: pkg,
        line: 0,
        message: `🚨 [LEY DE INTEGRIDAD ROTA]: El paquete no tiene un tsconfig.json.`,
        severity: "error",
      });
    }
  });

  return results;
}
