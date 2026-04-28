# lead_gen_worker.py

import asyncio
import logging
from typing import Any, Dict, List

from google.protobuf import json_format, struct_pb2

from app.contracts.lead_gen import LeadGenRequest
from app.grpc_generated import ai_engine_pb2
from app.helpers.telemetry import get_tracer
from opentelemetry.trace import Status, StatusCode

# Configuración de logging para el worker
logger = logging.getLogger(__name__)
tracer = get_tracer()

async def simulate_search(niche: str, location: str = "") -> List[Dict[str, Any]]:
    """
    Simula una búsqueda estructurada de leads de forma asíncrona (liberando el GIL).
    """
    with tracer.start_as_current_span("lead_gen.simulate_search") as span:
        span.set_attribute("search.niche", niche)
        span.set_attribute("search.location", location or "Global")
        
        logger.info(f"🔎 Buscando leads para: {niche} en {location or 'Global'}")
        
        # Base de datos simulada de empresas
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
        
        span.set_attribute("search.results_count", len(filtered))
        return filtered

async def process_lead_generation_task(request_payload: struct_pb2.Struct, trace_id: str) -> ai_engine_pb2.WorkerTaskResponse:
    """
    Procesa la tarea de generación de leads de manera asíncrona extrayendo datos estandarizados.
    """
    with tracer.start_as_current_span("lead_gen.process_task") as span:
        try:
            # 1. Validación Estricta con Pydantic (Ley #3)
            raw_payload = json_format.MessageToDict(request_payload)
            parsed_request = LeadGenRequest(**raw_payload)

            span.set_attributes({
                "lead_gen.niche": parsed_request.niche,
                "lead_gen.limit": parsed_request.limit,
                "lead_gen.trace_id": trace_id
            })

            print(f"--- [LEAD GEN WORKER] Iniciando prospección para: {parsed_request.niche} ---")

            # 2. Simulación de latencia de red asíncrona (libera Event Loop)
            await asyncio.sleep(1.5)
            
            # 3. Ejecución de la búsqueda
            leads = await simulate_search(parsed_request.niche, parsed_request.location)
            
            # 4. Formateo de resultados (LIMIT)
            final_leads = leads[:parsed_request.limit]
            result_data = {
                "status": "success",
                "leads_found": len(final_leads),
                "data": final_leads,
                "niche": parsed_request.niche,
                "location": parsed_request.location or "Not specified",
                "message": f"Se encontraron {len(final_leads)} leads potenciales."
            }
            
            # 5. Construimos la respuesta gRPC
            result_struct = struct_pb2.Struct()
            json_format.ParseDict(result_data, result_struct)

            print(f"--- [LEAD GEN WORKER] Tarea completada. {len(final_leads)} leads enviados ---")
            
            span.set_status(Status(StatusCode.OK))
            return ai_engine_pb2.WorkerTaskResponse(
                success=True,
                message=f"Proceso de Lead Generation exitoso para {parsed_request.niche}.",
                result=result_struct,
                trace_id=trace_id
            )
            
        except Exception as e:
            logger.error(f"❌ Error en Lead Gen Worker: {str(e)}")
            span.record_exception(e)
            span.set_status(Status(StatusCode.ERROR, str(e)))
            return ai_engine_pb2.WorkerTaskResponse(
                success=False,
                message=f"Error validando o procesando worker de Python: {str(e)}",
                error_code="PYTHON_WORKER_ERROR",
                trace_id=trace_id
            )
