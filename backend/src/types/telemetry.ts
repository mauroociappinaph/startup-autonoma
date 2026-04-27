export interface TelemetryEntry {
    node: string;
    duration: number;
    timestamp: string;
}

export interface TraceStore {
  traceId: string;
  startTime: number;
}
