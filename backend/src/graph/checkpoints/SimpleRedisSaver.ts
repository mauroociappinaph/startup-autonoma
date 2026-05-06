import {
  BaseCheckpointSaver,
  Checkpoint,
  CheckpointMetadata,
  CheckpointTuple,
  SerializerProtocol,
  PendingWrite,
  CheckpointListOptions,
} from "@langchain/langgraph-checkpoint";
import { RunnableConfig } from "@langchain/core/runnables";
import { Redis } from "ioredis";

/**
 * Implementación personalizada de CheckpointSaver para Redis estándar.
 * NO requiere RedisStack (RedisJSON/RediSearch).
 * Usa comandos HSET/HGET para almacenar checkpoints y metadatos.
 */
export class SimpleRedisSaver extends BaseCheckpointSaver {
  private client: Redis;

  constructor(client: Redis, serde?: SerializerProtocol) {
    super(serde);
    this.client = client;
  }

  private getCheckpointKey(threadId: string, checkpointNs: string, checkpointId: string): string {
    return `checkpoint:${threadId}:${checkpointNs || "default"}:${checkpointId}`;
  }

  private getLatestKey(threadId: string, checkpointNs: string): string {
    return `checkpoint:${threadId}:${checkpointNs || "default"}:latest`;
  }

  async getTuple(config: RunnableConfig): Promise<CheckpointTuple | undefined> {
    const { thread_id, checkpoint_ns, checkpoint_id } = config.configurable || {};
    if (!thread_id) return undefined;

    let targetId = checkpoint_id;
    if (!targetId) {
      targetId = await this.client.get(this.getLatestKey(thread_id, checkpoint_ns));
    }

    if (!targetId) return undefined;

    const keys = ["checkpoint", "checkpoint_type", "metadata", "metadata_type"];
    const [cBuffer, cType, mBuffer, mType] = await this.client.hmgetBuffer(this.getCheckpointKey(thread_id, checkpoint_ns, targetId), ...keys);
    
    if (!cBuffer) return undefined;

    const checkpoint = await this.serde.loadsTyped(cType?.toString() || "json", cBuffer) as Checkpoint;
    const metadata = mBuffer 
      ? await this.serde.loadsTyped(mType?.toString() || "json", mBuffer) as CheckpointMetadata
      : { source: "input", step: 0, parents: {} as Record<string, string> } as CheckpointMetadata;

    return {
      config: {
        configurable: {
          thread_id,
          checkpoint_ns,
          checkpoint_id: targetId,
        },
      },
      checkpoint,
      metadata,
    };
  }

  async *list(
    config: RunnableConfig,
    _options?: CheckpointListOptions
  ): AsyncGenerator<CheckpointTuple> {
    const { thread_id, checkpoint_ns } = config.configurable || {};
    if (!thread_id) return;

    const latestId = await this.client.get(this.getLatestKey(thread_id, checkpoint_ns));
    if (latestId) {
        const tuple = await this.getTuple({ configurable: { thread_id, checkpoint_ns, checkpoint_id: latestId } });
        if (tuple) yield tuple;
    }
  }

  async put(
    config: RunnableConfig,
    checkpoint: Checkpoint,
    metadata: CheckpointMetadata
  ): Promise<RunnableConfig> {
    const { thread_id, checkpoint_ns } = config.configurable || {};
    if (!thread_id) throw new Error("thread_id is required");

    const checkpointId = checkpoint.id;
    const key = this.getCheckpointKey(thread_id, checkpoint_ns, checkpointId);

    // dumpsTyped devuelve [type, bytes]
    const [cType, cBytes] = await this.serde.dumpsTyped(checkpoint);
    const [mType, mBytes] = await this.serde.dumpsTyped(metadata);

    await this.client.hset(key, {
      checkpoint: Buffer.from(cBytes),
      checkpoint_type: cType,
      metadata: Buffer.from(mBytes),
      metadata_type: mType,
    });

    // Actualizar el puntero al último checkpoint
    await this.client.set(this.getLatestKey(thread_id, checkpoint_ns), checkpointId);

    return {
      configurable: {
        thread_id,
        checkpoint_ns,
        checkpoint_id: checkpointId,
      },
    };
  }

  async putWrites(
    config: RunnableConfig,
    writes: PendingWrite[],
    taskId: string
  ): Promise<void> {
    const { thread_id, checkpoint_ns, checkpoint_id } = config.configurable || {};
    if (!thread_id || !checkpoint_id) return;

    const key = `writes:${thread_id}:${checkpoint_ns || "default"}:${checkpoint_id}:${taskId}`;
    const [type, bytes] = await this.serde.dumpsTyped(writes);

    await this.client.hset(key, {
      data: Buffer.from(bytes),
      type: type,
    });
  }

  async deleteThread(threadId: string): Promise<void> {
    const patterns = [`checkpoint:${threadId}:*`, `writes:${threadId}:*`];
    
    for (const pattern of patterns) {
      let cursor = "0";
      do {
        const [nextCursor, keys] = await this.client.scan(cursor, "MATCH", pattern, "COUNT", 100);
        cursor = nextCursor;
        if (keys.length > 0) {
          await this.client.del(...keys);
        }
      } while (cursor !== "0");
    }
  }
}
