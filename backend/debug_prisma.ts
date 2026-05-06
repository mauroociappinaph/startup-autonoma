import { projectService } from './src/services/projectService.js';

async function test() {
  try {
    console.log("🚀 Probando getOrCreateProject...");
    const project = await projectService.getOrCreateProject('default-startup');
    console.log("✅ Proyecto obtenido:", project);
    process.exit(0);
  } catch (error) {
    console.error("❌ ERROR DETECTADO:", error);
    process.exit(1);
  }
}

test();
