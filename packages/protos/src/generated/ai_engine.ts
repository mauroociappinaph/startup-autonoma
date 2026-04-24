import type * as grpc from '@grpc/grpc-js';
import type { EnumTypeDefinition, MessageTypeDefinition } from '@grpc/proto-loader';

import type { AIEngineClient as _ai_engine_AIEngineClient, AIEngineDefinition as _ai_engine_AIEngineDefinition } from './ai_engine/AIEngine.js';

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
  new(...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  ai_engine: {
    AIEngine: SubtypeConstructor<typeof grpc.Client, _ai_engine_AIEngineClient> & { service: _ai_engine_AIEngineDefinition }
    WorkerProgressUpdate: MessageTypeDefinition
    WorkerTaskRequest: MessageTypeDefinition
    WorkerTaskResponse: MessageTypeDefinition
  }
  google: {
    protobuf: {
      ListValue: MessageTypeDefinition
      NullValue: EnumTypeDefinition
      Struct: MessageTypeDefinition
      Value: MessageTypeDefinition
    }
  }
}

