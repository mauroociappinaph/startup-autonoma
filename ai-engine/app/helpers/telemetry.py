import os
from opentelemetry import trace
from opentelemetry.sdk.resources import SERVICE_NAME, Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter

def init_telemetry():
    """
    Inicializa el SDK de OpenTelemetry para el AI Engine.
    """
    if os.getenv("OTEL_ENABLED", "false").lower() != "true":
        return

    # Configuración de Recursos
    resource = Resource(attributes={SERVICE_NAME: "ai-engine"})

    # Proveedor de trazas
    provider = TracerProvider(resource=resource)
    
    # Exportador OTLP (usamos HTTP por simplicidad, igual que en el backend)
    endpoint = os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT", "http://localhost:4318/v1/traces")
    exporter = OTLPSpanExporter(endpoint=endpoint)
    
    processor = BatchSpanProcessor(exporter)
    provider.add_span_processor(processor)
    
    # Registrar el proveedor global
    trace.set_tracer_provider(provider)

def get_tracer():
    return trace.get_tracer("ai-engine")
