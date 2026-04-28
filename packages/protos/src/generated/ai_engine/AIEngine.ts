// Original file: src/ai_engine.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { Empty as _ai_engine_Empty, Empty__Output as _ai_engine_Empty__Output } from '../ai_engine/Empty';
import type { PingResponse as _ai_engine_PingResponse, PingResponse__Output as _ai_engine_PingResponse__Output } from '../ai_engine/PingResponse';
import type { WorkerProgressUpdate as _ai_engine_WorkerProgressUpdate, WorkerProgressUpdate__Output as _ai_engine_WorkerProgressUpdate__Output } from '../ai_engine/WorkerProgressUpdate';
import type { WorkerTaskRequest as _ai_engine_WorkerTaskRequest, WorkerTaskRequest__Output as _ai_engine_WorkerTaskRequest__Output } from '../ai_engine/WorkerTaskRequest';
import type { WorkerTaskResponse as _ai_engine_WorkerTaskResponse, WorkerTaskResponse__Output as _ai_engine_WorkerTaskResponse__Output } from '../ai_engine/WorkerTaskResponse';

export interface AIEngineClient extends grpc.Client {
  ExecuteWorkerTask(argument: _ai_engine_WorkerTaskRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_ai_engine_WorkerTaskResponse__Output>): grpc.ClientUnaryCall;
  ExecuteWorkerTask(argument: _ai_engine_WorkerTaskRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_ai_engine_WorkerTaskResponse__Output>): grpc.ClientUnaryCall;
  ExecuteWorkerTask(argument: _ai_engine_WorkerTaskRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_ai_engine_WorkerTaskResponse__Output>): grpc.ClientUnaryCall;
  ExecuteWorkerTask(argument: _ai_engine_WorkerTaskRequest, callback: grpc.requestCallback<_ai_engine_WorkerTaskResponse__Output>): grpc.ClientUnaryCall;
  executeWorkerTask(argument: _ai_engine_WorkerTaskRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_ai_engine_WorkerTaskResponse__Output>): grpc.ClientUnaryCall;
  executeWorkerTask(argument: _ai_engine_WorkerTaskRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_ai_engine_WorkerTaskResponse__Output>): grpc.ClientUnaryCall;
  executeWorkerTask(argument: _ai_engine_WorkerTaskRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_ai_engine_WorkerTaskResponse__Output>): grpc.ClientUnaryCall;
  executeWorkerTask(argument: _ai_engine_WorkerTaskRequest, callback: grpc.requestCallback<_ai_engine_WorkerTaskResponse__Output>): grpc.ClientUnaryCall;
  
  Ping(argument: _ai_engine_Empty, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_ai_engine_PingResponse__Output>): grpc.ClientUnaryCall;
  Ping(argument: _ai_engine_Empty, metadata: grpc.Metadata, callback: grpc.requestCallback<_ai_engine_PingResponse__Output>): grpc.ClientUnaryCall;
  Ping(argument: _ai_engine_Empty, options: grpc.CallOptions, callback: grpc.requestCallback<_ai_engine_PingResponse__Output>): grpc.ClientUnaryCall;
  Ping(argument: _ai_engine_Empty, callback: grpc.requestCallback<_ai_engine_PingResponse__Output>): grpc.ClientUnaryCall;
  ping(argument: _ai_engine_Empty, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_ai_engine_PingResponse__Output>): grpc.ClientUnaryCall;
  ping(argument: _ai_engine_Empty, metadata: grpc.Metadata, callback: grpc.requestCallback<_ai_engine_PingResponse__Output>): grpc.ClientUnaryCall;
  ping(argument: _ai_engine_Empty, options: grpc.CallOptions, callback: grpc.requestCallback<_ai_engine_PingResponse__Output>): grpc.ClientUnaryCall;
  ping(argument: _ai_engine_Empty, callback: grpc.requestCallback<_ai_engine_PingResponse__Output>): grpc.ClientUnaryCall;
  
  StreamWorkerProgress(argument: _ai_engine_WorkerTaskRequest, metadata: grpc.Metadata, options?: grpc.CallOptions): grpc.ClientReadableStream<_ai_engine_WorkerProgressUpdate__Output>;
  StreamWorkerProgress(argument: _ai_engine_WorkerTaskRequest, options?: grpc.CallOptions): grpc.ClientReadableStream<_ai_engine_WorkerProgressUpdate__Output>;
  streamWorkerProgress(argument: _ai_engine_WorkerTaskRequest, metadata: grpc.Metadata, options?: grpc.CallOptions): grpc.ClientReadableStream<_ai_engine_WorkerProgressUpdate__Output>;
  streamWorkerProgress(argument: _ai_engine_WorkerTaskRequest, options?: grpc.CallOptions): grpc.ClientReadableStream<_ai_engine_WorkerProgressUpdate__Output>;
  
}

export interface AIEngineHandlers extends grpc.UntypedServiceImplementation {
  ExecuteWorkerTask: grpc.handleUnaryCall<_ai_engine_WorkerTaskRequest__Output, _ai_engine_WorkerTaskResponse>;
  
  Ping: grpc.handleUnaryCall<_ai_engine_Empty__Output, _ai_engine_PingResponse>;
  
  StreamWorkerProgress: grpc.handleServerStreamingCall<_ai_engine_WorkerTaskRequest__Output, _ai_engine_WorkerProgressUpdate>;
  
}

export interface AIEngineDefinition extends grpc.ServiceDefinition {
  ExecuteWorkerTask: MethodDefinition<_ai_engine_WorkerTaskRequest, _ai_engine_WorkerTaskResponse, _ai_engine_WorkerTaskRequest__Output, _ai_engine_WorkerTaskResponse__Output>
  Ping: MethodDefinition<_ai_engine_Empty, _ai_engine_PingResponse, _ai_engine_Empty__Output, _ai_engine_PingResponse__Output>
  StreamWorkerProgress: MethodDefinition<_ai_engine_WorkerTaskRequest, _ai_engine_WorkerProgressUpdate, _ai_engine_WorkerTaskRequest__Output, _ai_engine_WorkerProgressUpdate__Output>
}
