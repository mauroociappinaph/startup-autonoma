// Original file: src/ai_engine.proto

import type { Struct as _google_protobuf_Struct, Struct__Output as _google_protobuf_Struct__Output } from '../google/protobuf/Struct.js';

export interface WorkerTaskResponse {
  'success'?: (boolean);
  'message'?: (string);
  'result'?: (_google_protobuf_Struct | null);
  'errorCode'?: (string);
}

export interface WorkerTaskResponse__Output {
  'success': (boolean);
  'message': (string);
  'result': (_google_protobuf_Struct__Output | null);
  'errorCode': (string);
}
