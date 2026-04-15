import fs from 'fs';
import path from 'path';

/**
 * Sync Project Structure
 * Este script escanea el proyecto y actualiza la sección de estructura en AGENTS.md
 */

const projectRoot = process.cwd();
const agentsConfigPath = path.join(projectRoot, 'AGENTS.md');

// Carpetas que queremos ignorar en el mapa de arquitectura
const ignoreList = ['node_modules', '.git', '.husky', '.turbo', 'dist', 'build', '.next', '.gemini'];

// Carpetas que se renderizan con profundidad ilimitada (docs siempre completo)
const deepScanList = ['docs'];

function generateTree(dir, depth = 0, maxDepth = 2) {
  if (depth > maxDepth) return '';

  let tree = '';
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    if (ignoreList.includes(file)) return;

    const fullPath = path.join(dir, file);
    const stats = fs.statSync(fullPath);
    const indent = '│   '.repeat(depth);

    if (stats.isDirectory()) {
      tree += `${indent}├── /${file}\n`;
      // Si es una carpeta de deep scan, la recorremos completa
      const subMaxDepth = deepScanList.includes(file) ? Infinity : maxDepth;
      tree += generateTree(fullPath, depth + 1, subMaxDepth);
    } else {
      // Solo archivos importantes en la raíz de las carpetas
      if (depth === 0 || file.endsWith('.ts') || file.endsWith('.json') || file === 'package.json') {
          tree += `${indent}├── ${file}\n`;
      }
    }
  });

  return tree;
}

/**
 * Escanea AGENTS.md y extrae todas las rutas a archivos .md mencionados.
 * Busca patrones como `/docs/architecture/foo.md`, `docs/foo.md`, `.md` referencias.
 */
function extractReferencedDocs() {
  if (!fs.existsSync(agentsConfigPath)) return new Set();

  const content = fs.readFileSync(agentsConfigPath, 'utf8');
  // Match any path ending in .md or that looks like a docs reference
  const mdRegex = /(?:`|\/)?(?:docs\/[\w/-]+)(?:\.md)?(?:`)?/g;
  const matches = content.match(mdRegex) || [];

  const refs = new Set();
  matches.forEach(match => {
    // Clean backticks and trailing slashes
    let cleaned = match.replace(/`/g, '').replace(/\/$/, '');
    if (!cleaned.endsWith('.md')) cleaned += '.md';
    refs.add(cleaned);
  });

  return refs;
}

/**
 * Recolecta todos los archivos .md reales dentro de docs/
 */
function collectActualDocs(dir) {
  let files = [];
  const entries = fs.readdirSync(dir);

  entries.forEach(entry => {
    if (ignoreList.includes(entry)) return;
    const fullPath = path.join(dir, entry);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      files = files.concat(collectActualDocs(fullPath));
    } else if (entry.endsWith('.md')) {
      files.push(fullPath);
    }
  });

  return files;
}

/**
 * Detecta archivos en docs/ que no están referenciados en AGENTS.md
 */
function findUnreferencedDocs() {
  const docsDir = path.join(projectRoot, 'docs');
  if (!fs.existsSync(docsDir)) return [];

  const referenced = extractReferencedDocs();
  const actualFiles = collectActualDocs(docsDir);

  const unreferenced = [];
  actualFiles.forEach(file => {
    const relative = path.relative(projectRoot, file);
    // Check if this file (or its base name) is referenced
    const isReferenced = [...referenced].some(ref =>
      ref.includes(relative) || ref.includes(path.basename(file))
    );
    if (!isReferenced) {
      unreferenced.push(relative);
    }
  });

  return unreferenced;
}

function updateAgentsMD() {
  if (!fs.existsSync(agentsConfigPath)) {
    console.error('❌ No se encontró AGENTS.md');
    return;
  }

  const content = fs.readFileSync(agentsConfigPath, 'utf8');
  const structureMarkerStart = '## --- Estructura del Proyecto (Versión 2026 - Optimizada) ---';
  const structureMarkerEnd = '---';

  const sections = content.split(structureMarkerStart);
  if (sections.length < 2) {
    console.error('❌ No se encontró la sección de estructura en AGENTS.md');
    return;
  }

  const secondPart = sections[1].split(structureMarkerEnd);

  // Generar el nuevo árbol (docs/ con profundidad completa)
  const newTree = `\n\n\`\`\`text\n/\n${generateTree(projectRoot, 0, 2)}\`\`\`\n\n`;

  const newContent = sections[0] + structureMarkerStart + newTree + structureMarkerEnd + secondPart.slice(1).join(structureMarkerEnd);

  fs.writeFileSync(agentsConfigPath, newContent);
  console.log('✅ AGENTS.md actualizado con la estructura real del proyecto.');

  // Detectar docs no referenciados
  const unreferenced = findUnreferencedDocs();
  if (unreferenced.length > 0) {
    console.warn('⚠️  Archivos en docs/ sin referencia en AGENTS.md:');
    unreferenced.forEach(f => console.warn(`   - ${f}`));
  } else {
    console.log('✅ Todos los archivos de docs/ están referenciados en AGENTS.md.');
  }
}

updateAgentsMD();
