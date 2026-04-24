// Original file: src/ai_engine.proto

import type { Struct as _google_protobuf_Struct, Struct__Output as _google_protobuf_Struct__Output } from '../google/protobuf/Struct';

export interface WorkerTaskRequest {
  'workerName'?: (string);
  'taskDescription'?: (string);
  'traceId'?: (string);
  'payload'?: (_google_protobuf_Struct | null);
}

export interface WorkerTaskRequest__Output {
  'workerName': (string);
  'taskDescription': (string);
  'traceId': (string);
  'payload': (_google_protobuf_Struct__Output | null);
}
