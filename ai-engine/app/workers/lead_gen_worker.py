# lead_gen_worker.py

import time
import json
from typing import Dict, Any
from google.protobuf import json_format
from ai_engine_pb2 import WorkerTaskResponse, WorkerProgressUpdate # Asumiendo que estos se generan al compilar el proto

def process_lead_generation_task(request_payload: Dict[str, Any], trace_id: str) -> WorkerTaskResponse:
    """
    Simula la generación de leads, extrayendo datos y devolviendo un resultado.
    En un escenario real, esto interactuaría con APIs externas o web scraping.
    """
    print(f"--- [LEAD GEN WORKER] Procesando tarea con trace_id: {trace_id} ---")
    print(f"Payload recibido: {json.format_string(json.dumps(request_payload, indent=2))}") # Usar format_string para serialización

    try:
        # Simulación de trabajo pesado
        time.sleep(2) 
        
        # Simulación de resultados
        leads_data = [
            {"name": "Juan Perez", "email": "juan.perez@example.com", "company": "TechCorp"},
            {"name": "Maria Garcia", "email": "maria.garcia@example.com", "company": "InnovateLtd"}
        ]
        
        result_payload = {
            "status": "completed",
            "output": leads_data,
            "source": "simulated_web_scraping",
            "generated_leads_count": len(leads_data)
        }
        
        print(f"--- [LEAD GEN WORKER] Tarea completada para trace_id: {trace_id} ---")
        
        # Devolvemos la respuesta estructurada según el proto
        return WorkerTaskResponse(
            success=True,
            message=f"{len(leads_data)} leads generados exitosamente.",
            result=json_format.ParseDict(result_data, WorkerTaskResponse().result),
            trace_id=trace_id
        )
        
    except Exception as e:
        print(f"❌ Error en Lead Gen Worker (trace_id={trace_id}): {e}")
        return WorkerTaskResponse(
            success=False,
            message=f"Error al procesar tarea de lead generation: {e}",
            error_code="LEADGEN_ERROR",
            trace_id=trace_id
        )

# Nota: Para streaming, necesitaríamos una función generadora separada
# que use 'yield' para enviar WorkerProgressUpdate.
