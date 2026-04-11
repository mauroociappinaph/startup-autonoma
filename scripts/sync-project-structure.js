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
      tree += generateTree(fullPath, depth + 1, maxDepth);
    } else {
      // Solo archivos importantes en la raíz de las carpetas
      if (depth === 0 || file.endsWith('.ts') || file.endsWith('.json') || file === 'package.json') {
          tree += `${indent}├── ${file}\n`;
      }
    }
  });

  return tree;
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
  
  // Generar el nuevo árbol
  const newTree = `\n\n\`\`\`text\n/\n${generateTree(projectRoot, 0, 2)}\`\`\`\n\n`;

  const newContent = sections[0] + structureMarkerStart + newTree + structureMarkerEnd + secondPart.slice(1).join(structureMarkerEnd);

  fs.writeFileSync(agentsConfigPath, newContent);
  console.log('✅ AGENTS.md actualizado con la estructura real del proyecto.');
}

updateAgentsMD();
