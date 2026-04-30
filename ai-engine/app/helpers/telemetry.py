import os

from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.grpc import GrpcInstrumentorServer
from opentelemetry.sdk.resources import SERVICE_NAME, Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor


def init_telemetry():
    """
    Inicializa el SDK de OpenTelemetry para el AI Engine.
    """
    if os.getenv("OTEL_ENABLED", "false").lower() != "true":
        print("⚠️ [OTEL] OpenTelemetry is disabled via OTEL_ENABLED env var.")
        return

    # Configuración de Recursos
    resource = Resource(attributes={SERVICE_NAME: "ai-engine"})

    # Proveedor de trazas
    provider = TracerProvider(resource=resource)
    
    # Exportador OTLP
    endpoint = os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT", "http://localhost:4318/v1/traces")
    exporter = OTLPSpanExporter(endpoint=endpoint)
    
    processor = BatchSpanProcessor(exporter)
    provider.add_span_processor(processor)
    
    # Registrar el proveedor global
    trace.set_tracer_provider(provider)

    # Instrumentar gRPC Server (esto permite recibir el contexto de traza de Node.js)
    GrpcInstrumentorServer().instrument()
    
    print(f"🛡️ [OTEL] OpenTelemetry Initialized in AI Engine (Exporting to {endpoint})")

def get_tracer():
    return trace.get_tracer("ai-engine")
