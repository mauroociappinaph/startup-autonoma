import pytest
from google.protobuf import struct_pb2

from app.workers.lead_gen_worker import process_lead_generation_task


@pytest.mark.asyncio
async def test_lead_gen_worker_concurrency():
    # Setup mock request
    payload = struct_pb2.Struct()
    payload.update({
        "niche": "FinTech",
        "limit": 2
    })
    
    # Run task
    response = await process_lead_generation_task(payload, "test-trace")
    
    assert response.success is True
    assert response.trace_id == "test-trace"
    assert "leads_found" in response.result
    assert response.result["leads_found"] > 0
