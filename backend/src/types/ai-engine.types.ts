/**
 * Tarea para el AI Engine Worker.
 */
export interface AIEngineTask {
  worker_name: string;
  task_description: string;
  trace_id?: string;
  payload?: object;
}
