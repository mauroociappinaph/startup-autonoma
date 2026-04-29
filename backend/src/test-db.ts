import { projectService } from "./services/projectService.js";
import { SacredLogger } from "./helpers/logger.js";
import { prisma } from "@startup/db";

async function testSupabase() {
  try {
    SacredLogger.info("🚀 Iniciando test de conexión a Supabase...", "TEST-DB");
    
    const projectName = `Test Project ${Date.now()}`;
    const project = await projectService.getOrCreateProject(projectName);
    
    SacredLogger.info(`✅ Proyecto creado/recuperado: ${project.name} (ID: ${project.projectId})`, "TEST-DB");
    
    const dbProject = await prisma.project.findUnique({
      where: { projectId: project.projectId }
    });
    
    if (dbProject) {
      SacredLogger.info("🎉 Verificación en SQL Exitosa!", "TEST-DB");
    } else {
      SacredLogger.error("❌ El proyecto no se encontró en SQL", "", "TEST-DB");
    }
    
  } catch (error) {
    SacredLogger.error("💥 Error en el test de DB", (error as Error).message, "TEST-DB");
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

testSupabase();
