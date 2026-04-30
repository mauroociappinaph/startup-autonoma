import os
import unittest

from opentelemetry import trace

from app.helpers.telemetry import init_telemetry


class TestTelemetry(unittest.TestCase):
    def test_init_telemetry(self):
        # Forzar habilitación
        os.environ["OTEL_ENABLED"] = "true"
        os.environ["OTEL_EXPORTER_OTLP_ENDPOINT"] = "http://localhost:4318/v1/traces"
        
        try:
            init_telemetry()
            tracer = trace.get_tracer("test-tracer")
            with tracer.start_as_current_span("test-span") as span:
                self.assertIsNotNone(span.get_span_context().trace_id)
                print(f"✅ Python Trace ID: {span.get_span_context().trace_id:032x}")
            print("✅ Telemetry initialized and span created in Python.")
        except Exception as e:
            self.fail(f"Telemetry initialization failed: {e}")

if __name__ == "__main__":
    unittest.main()
