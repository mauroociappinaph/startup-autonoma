import fs from "fs/promises";
import path from "path";
import { ProjectContext, ProjectContextSchema } from "@startup/shared";
import { v4 as uuidv4 } from "uuid";

/**
 * Servicio para la gestión del ciclo de vida y aislamiento de proyectos (Gap 2).
 * Se encarga de crear workspaces físicos y namespaces lógicos para cada Startup.
 */
class ProjectService {
  private readonly BASE_WORKSPACE = path.resolve(process.cwd(), "workspaces");

  /**
   * Inicializa un contexto de proyecto. 
   * Asegura que el directorio físico exista y retorna los metadatos de aislamiento.
   */
  async getOrCreateProject(name: string, repoUrl?: string): Promise<ProjectContext> {
    // Generar un slug para el sistema de archivos (ej: "Mi Startup" -> "mi-startup")
    const projectSlug = name.toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

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
    };

    // Validación estricta del contrato Zod
    return ProjectContextSchema.parse(context);
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
