import fs from 'fs';
import path from 'path';

let errors = 0;

const IGNORE_DIRS = ['node_modules', 'dist', '.git', '.next', '.husky', 'types'];

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

function verifyIsolation(filePath) {
  if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;
  if (filePath.includes('.test.ts') || filePath.includes('types/')) return;

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // LEY DE GRANULARIDAD: No se permiten interfaces o tipos definidos en componentes/helpers
  if (content.includes('interface ') || content.includes('type ')) {
    // Excepción: tipos genéricos simples o mapeos inline que no sean 'interface Name {' o 'type Name = {'
    const matches = content.match(/(^|\s)(interface|type)\s+[A-Z][a-zA-Z0-9]*\s*({|=)/g);
    if (matches) {
      console.error(`🚨 [AISLAMIENTO DE TIPOS ROTO]: Se detectó definición de tipos/interfaces en ${filePath}.`);
      console.error(`👉 Por ley de arquitectura, mové estas definiciones a src/types/local o src/types/shared.`);
      errors++;
    }
  }
}

console.log("🔍 Verificando Aislamiento de Tipos (Ley de Granularidad Absoluta)...");

walkDir(path.join(process.cwd(), 'frontend', 'src'), verifyIsolation);

if (errors > 0) {
  console.error(`\n❌ Se encontraron ${errors} infracciones. El código no es Enterprise-Ready.`);
  process.exit(1);
} else {
  console.log("✅ Aislamiento de tipos perfecto. Arquitectura impecable.");
  process.exit(0);
}
