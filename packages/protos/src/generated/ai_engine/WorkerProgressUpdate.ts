// Original file: src/ai_engine.proto


export interface WorkerProgressUpdate {
  'status'?: (string);
  'progressPercentage'?: (number | string);
  'logMessage'?: (string);
  'traceId'?: (string);
}

export interface WorkerProgressUpdate__Output {
  'status': (string);
  'progressPercentage': (number);
  'logMessage': (string);
  'traceId': (string);
}
