const fs = require('fs');
const path = require('path');

const MAX_LINES = 300;

// Directorios a ignorar
const IGNORE_DIRS = ['node_modules', 'dist', '.git', '.next', '.husky', '.github'];

let errors = 0;

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) {
      if (!IGNORE_DIRS.includes(f)) walkDir(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

function checkSacredLaws(filePath) {
  // Ignorar archivos que no sean código puro o documentación
  if (filePath.endsWith('.json') || filePath.endsWith('.lock') || filePath.endsWith('.md')) return;

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // Regla 3: Límite de Archivo (Máximo 300 líneas)
  if (lines.length > MAX_LINES) {
    console.error(`🚨 [LEY #3 ROTA]: ${filePath} tiene ${lines.length} líneas (Máximo ${MAX_LINES}). Refactoriza y divide.`);
    errors++;
  }

  // Análisis exclusivo para TypeScript
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    const isInsideTypesFolder = filePath.includes('/types/');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Regla 7: Types de TypeScript siempre van en /types
      if (!isInsideTypesFolder && (line.includes('export interface ') || line.includes('export type '))) {
        console.error(`🚨 [LEY #7 ROTA]: ${filePath}:${i + 1} exporta un tipo o interfaz fuera de la carpeta /types.`);
        errors++;
      }

      // Regla 8: Rutas relativas para importar módulos internos
      // Detectamos si hay imports absolutos apuntando a carpetas del proyecto
      // Ej: import { X } from 'src/algo' o import { Y } from 'backend/algo'
      const absoluteImportMatch = line.match(/import\s+.*from\s+['"](src\/|backend\/|frontend\/|ai-engine\/|app\/).*['"]/);
      if (absoluteImportMatch) {
         console.error(`🚨 [LEY #8 ROTA]: ${filePath}:${i + 1} usa un import absoluto hacia un módulo interno (${absoluteImportMatch[1]}). Usa './' o '../'.`);
         errors++;
      }
    }
  }
}

// Analizar carpetas backend, frontend y ai-engine
const targetDirs = [
  path.join(__dirname, '../backend'),
  path.join(__dirname, '../frontend'),
  path.join(__dirname, '../ai-engine')
];

console.log('🔍 Auditando cumplimiento de Leyes Sagradas...\n');

targetDirs.forEach(dir => walkDir(dir, checkSacredLaws));

if (errors > 0) {
  console.error(`\n❌ Se encontraron ${errors} infracciones a la arquitectura.`);
  process.exit(1);
} else {
  console.log('✅ Todas las Leyes Sagradas se cumplen a rajatabla.');
}
