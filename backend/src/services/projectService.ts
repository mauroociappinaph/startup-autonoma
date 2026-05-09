import fs from "fs/promises";
import path from "path";
import { ProjectContext, ProjectContextSchema } from "@startup/shared";
import { v4 as uuidv4 } from "uuid";
import { getRedisConnection } from "../db/redis.js";
import { prisma, Prisma } from "@startup/db";

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

    // 1. Intentar recuperar de PostgreSQL primero (Fuente de Verdad)
    const dbProject = await prisma.project.findFirst({
      where: { name: name } // O usar el slug si lo guardamos
    });

    if (dbProject) {
      // Sincronizar Redis si no está (cache)
      await redis.set(`${ProjectService.SLUG_MAP_PREFIX}${projectSlug}`, dbProject.projectId);
      return ProjectContextSchema.parse(dbProject);
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

    // 2. Persistir en PostgreSQL y Redis
    await this.saveProject(validated);
    await redis.set(`${ProjectService.SLUG_MAP_PREFIX}${projectSlug}`, validated.projectId);

    return validated;
  }

  /**
   * Recupera un proyecto por su ID. Primero busca en Redis (cache) y luego en PostgreSQL.
   */
  async getProject(projectId: string): Promise<ProjectContext | null> {
    const redis = getRedisConnection();
    
    // Cache Check
    const cached = await redis.get(`${ProjectService.KEY_PREFIX}${projectId}`);
    if (cached) return ProjectContextSchema.parse(JSON.parse(cached));

    // DB Fallback
    const dbProject = await prisma.project.findUnique({
      where: { projectId }
    });

    if (dbProject) {
      const context = ProjectContextSchema.parse(dbProject);
      await this.syncCache(context);
      return context;
    }

    return null;
  }

  /**
   * Guarda o actualiza un proyecto en PostgreSQL y sincroniza el cache de Redis.
   */
  async saveProject(project: ProjectContext): Promise<void> {
    const validated = ProjectContextSchema.parse(project);

    // Preparamos el metadato con un cast para Prisma (Gap 2)
    const metadata = (validated.metadata || {}) as any; // architecture-disable

    // SQL Upsert
    await prisma.project.upsert({
      where: { projectId: validated.projectId },
      update: {
        name: validated.name,
        repoUrl: validated.repoUrl,
        workDir: validated.workDir,
        maxUsdBudget: validated.maxUsdBudget,
        maxTokenBudget: validated.maxTokenBudget,
        // @ts-ignore
        metadata
      },
      create: {
        projectId: validated.projectId,
        name: validated.name,
        repoUrl: validated.repoUrl,
        workDir: validated.workDir,
        engramNamespace: validated.engramNamespace,
        maxUsdBudget: validated.maxUsdBudget,
        maxTokenBudget: validated.maxTokenBudget,
        // @ts-ignore
        metadata
      }
    });

    // Cache Sync
    await this.syncCache(validated);
  }

  private async syncCache(project: ProjectContext): Promise<void> {
    const redis = getRedisConnection();
    await redis.set(
      `${ProjectService.KEY_PREFIX}${project.projectId}`, 
      JSON.stringify(project),
      "EX", 3600 // Cache por 1 hora
    );
  }

  /**
   * Actualiza el presupuesto en USD de un proyecto y sincroniza cache.
   */
  async updateBudget(projectId: string, maxUsdBudget: number): Promise<ProjectContext> {
    const project = await this.getProject(projectId);
    if (!project) throw new Error(`Project ${projectId} not found`);

    project.maxUsdBudget = maxUsdBudget;
    await this.saveProject(project);
    return project;
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
