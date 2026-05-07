# Specification: Worker Progress Streaming (Issue #198)

## Requirements
- **R1: Real-time Updates**: Progress updates must reach the UI in under 200ms from emission.
- **R2: Standardized Payload**: All progress updates must include `status`, `progress_percentage`, and `log_message`.
- **R3: Traceability**: Every update must be linked to the original `trace_id`.
- **R4: Non-blocking**: The progress streaming must not interfere with the execution of the main task.

## Scenarios

### Scenario 1: Lead Gen Progress
- **Given**: A user starts a Lead Generation mission.
- **When**: The Lead Gen Worker starts searching.
- **Then**: It emits an update: `status="searching", progress=20%, log="🔎 Buscando leads en FinTech..."`.
- **And**: The Dashboard shows this message instantly.

### Scenario 2: Error Reporting during Stream
- **Given**: A worker encounters a non-fatal retryable error.
- **When**: It emits a progress log with the error details.
- **Then**: The UI shows the warning without stopping the main process.

## Data Schema (gRPC)
```protobuf
message WorkerProgressUpdate {
  string status = 1;
  float progress_percentage = 2;
  string log_message = 3;
  string trace_id = 4;
}
```
