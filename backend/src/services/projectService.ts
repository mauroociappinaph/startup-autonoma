import fs from "fs/promises";
import path from "path";
import { ProjectContext, ProjectContextSchema } from "@startup/shared";
import { v4 as uuidv4 } from "uuid";
import { getRedisConnection } from "../db/redis.js";

/**
 * Servicio para la gestión del ciclo de vida y aislamiento de proyectos (Gap 2).
 * Se encarga de crear workspaces físicos y namespaces lógicos para cada Startup.
 */
class ProjectService {
  private readonly BASE_WORKSPACE = path.resolve(process.cwd(), "workspaces");
  private static readonly KEY_PREFIX = "project:config:";
  private static readonly SLUG_MAP_PREFIX = "project:slug:map:";

  /**
   * Inicializa un contexto de proyecto. 
   * Asegura que el directorio físico exista y retorna los metadatos de aislamiento.
   */
  async getOrCreateProject(name: string, repoUrl?: string): Promise<ProjectContext> {
    const redis = getRedisConnection();
    
    // Generar un slug para el sistema de archivos y mapeo (ej: "Mi Startup" -> "mi-startup")
    const projectSlug = name.toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // 1. Intentar recuperar ID existente por slug
    const existingId = await redis.get(`${ProjectService.SLUG_MAP_PREFIX}${projectSlug}`);
    
    if (existingId) {
      const existingProject = await this.getProject(existingId);
      if (existingProject) return existingProject;
    }

    const workDir = path.join(this.BASE_WORKSPACE, projectSlug);

    // Asegurar infraestructura física del workspace
    await fs.mkdir(workDir, { recursive: true });

    const context: ProjectContext = {
      projectId: uuidv4(),
      name,
      repoUrl,
      workDir,
      engramNamespace: `project:${projectSlug}`,
      maxTokenBudget: 1000000,
      maxUsdBudget: 10.0,
    };

    const validated = ProjectContextSchema.parse(context);

    // 2. Persistir configuración y mapeo
    await this.saveProject(validated);
    await redis.set(`${ProjectService.SLUG_MAP_PREFIX}${projectSlug}`, validated.projectId);

    return validated;
  }

  /**
   * Recupera un proyecto por su ID desde Redis.
   */
  async getProject(projectId: string): Promise<ProjectContext | null> {
    const redis = getRedisConnection();
    const data = await redis.get(`${ProjectService.KEY_PREFIX}${projectId}`);
    
    if (!data) return null;
    return ProjectContextSchema.parse(JSON.parse(data));
  }

  /**
   * Guarda o actualiza un proyecto en Redis.
   */
  async saveProject(project: ProjectContext): Promise<void> {
    const redis = getRedisConnection();
    const validated = ProjectContextSchema.parse(project);
    await redis.set(
      `${ProjectService.KEY_PREFIX}${validated.projectId}`, 
      JSON.stringify(validated)
    );
  }

  /**
   * Resuelve la ruta absoluta de un archivo dentro del contexto de un proyecto.
   * Evita ataques de Path Traversal asegurando que el archivo esté dentro del workDir.
   */
  resolvePath(project: ProjectContext, relativePath: string): string {
    const absolutePath = path.resolve(project.workDir, relativePath);
    if (!absolutePath.startsWith(project.workDir)) {
      throw new Error(`Acceso denegado: el path "${relativePath}" está fuera del workspace del proyecto.`);
    }
    return absolutePath;
  }
}

export const projectService = new ProjectService();
