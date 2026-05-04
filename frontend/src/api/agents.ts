import { apiClient } from "./client";

/**
 * Servicio para interactuar con los agentes.
 * Encapsula las llamadas al proxy de Next.js.
 */
export const agentService = {
  /**
   * Envía una aprobación o rechazo de un plan.
   * Nota: Se usa fetch nativo porque Axios no soporta ReadableStream en el navegador fácilmente.
   */
  async respondToPlan(data: { threadId: string; status: 'approved' | 'rejected'; feedback?: string }) {
    const response = await fetch('/api/agents/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error('Fallo en la respuesta al plan');
    return response.body?.getReader();
  },

  /**
   * Ejecuta un rewind a un checkpoint específico.
   * Aquí sí usamos Axios (apiClient) porque es una petición REST estándar.
   */
  async rewind(threadId: string, checkpointId: string) {
    return apiClient.post('/agents/rewind', { threadId, checkpointId });
  },

  /**
   * Obtiene el historial y estado actual de un thread.
   */
  async getHistory(threadId: string) {
    const response = await apiClient.get(`/agents/history/${threadId}`);
    return response.data;
  },

  /**
   * Actualiza el presupuesto de un proyecto.
   */
  async updateProjectBudget(projectId: string, maxUsdBudget: number) {
    return apiClient.patch(`/projects/${projectId}/budget`, { maxUsdBudget });
  },

  /**
   * Obtiene la telemetría detallada por cada nodo del proyecto.
   */
  async getNodeTelemetry(projectId: string) {
    const response = await apiClient.get(`/telemetry/${projectId}/nodes`);
    return response.data;
  }
};
