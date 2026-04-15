# lead_gen_worker.py

import time
import logging
from typing import Dict, Any, List
from google.protobuf import json_format, struct_pb2
import ai_engine_pb2

# Configuración de logging para el worker
logger = logging.getLogger(__name__)

def simulate_search(niche: str, location: str = "") -> List[Dict[str, Any]]:
    """
    Simula una búsqueda estructurada de leads basada en nicho y ubicación.
    Idealmente aquí se llamaría a una API de búsqueda o un scraper real.
    """
    logger.info(f"🔎 Buscando leads para: {niche} en {location or 'Global'}")
    
    # Base de datos simulada de empresas (para demostrar el razonamiento)
    mock_directory = [
        {"name": "FinTech Soluciones México", "email": "contacto@fintechsol.mx", "industry": "FinTech", "location": "Ciudad de México"},
        {"name": "Digital Payments Latam", "email": "info@digipay.mx", "industry": "FinTech", "location": "Monterrey"},
        {"name": "CrediAgil", "email": "ventas@crediagil.com", "industry": "FinTech", "location": "Guadalajara"},
        {"name": "Neobank MX", "email": "hr@neobank.mx", "industry": "FinTech", "location": "Ciudad de México"},
        {"name": "PaySmart Systems", "email": "support@paysmart.mx", "industry": "FinTech", "location": "Puebla"},
        {"name": "Global Tech Corp", "email": "hello@globaltech.com", "industry": "Software", "location": "USA"},
    ]
    
    # Filtramos por nicho y locación
    filtered = [
        lead for lead in mock_directory 
        if niche.lower() in lead["industry"].lower() and 
        (not location or location.lower() in lead["location"].lower())
    ]
    
    return filtered[:10] # Limitamos a 10 leads

def process_lead_generation_task(request_payload: struct_pb2.Struct, trace_id: str) -> ai_engine_pb2.WorkerTaskResponse:
    """
    Procesa la tarea de generación de leads extrayendo datos y devolviendo un resultado estructurado.
    """
    # Convertimos el Struct de gRPC a un diccionario de Python
    payload = json_format.MessageToDict(request_payload)
    
    niche = payload.get("niche", "software_development")
    location = payload.get("location", "")
    limit = payload.get("limit", 5)

    print(f"--- [LEAD GEN WORKER] Iniciando prospección para: {niche} ---")

    try:
        # 1. Simulación de latencia de red (Scraping)
        time.sleep(1.5)
        
        # 2. Ejecución de la búsqueda
        leads = simulate_search(niche, location)
        
        # 3. Formateo de resultados
        result_data = {
            "status": "success",
            "leads_found": len(leads),
            "data": leads[:limit],
            "niche": niche,
            "location": location or "Not specified",
            "message": f"Se encontraron {len(leads)} leads potenciales."
        }
        
        # 4. Construimos la respuesta gRPC
        # El campo 'result' en el proto es un google.protobuf.Struct
        result_struct = struct_pb2.Struct()
        json_format.ParseDict(result_data, result_struct)

        print(f"--- [LEAD GEN WORKER] Tarea completada. {len(leads)} leads enviados ---")
        
        return ai_engine_pb2.WorkerTaskResponse(
            success=True,
            message=f"Proceso de Lead Generation exitoso para {niche}.",
            result=result_struct,
            trace_id=trace_id
        )
        
    except Exception as e:
        logger.error(f"❌ Error en Lead Gen Worker: {str(e)}")
        return ai_engine_pb2.WorkerTaskResponse(
            success=False,
            message=f"Error interno en el worker de Python: {str(e)}",
            error_code="PYTHON_WORKER_ERROR",
            trace_id=trace_id
        )
