import { jest } from '@jest/globals';

/**
 * RedisPipeline: Interface for the mocked Redis pipeline.
 */
export interface RedisPipeline {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rpush: jest.Mock<(...args: any[]) => RedisPipeline>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lpush: jest.Mock<(...args: any[]) => RedisPipeline>;
  ltrim: jest.Mock<(k: string, s: number, e: number) => RedisPipeline>;
  expire: jest.Mock<(k: string, s: number) => RedisPipeline>;
  hincrbyfloat: jest.Mock<(k: string, f: string, v: number) => RedisPipeline>;
  hincrby: jest.Mock<(k: string, f: string, v: number) => RedisPipeline>;
  hset: jest.Mock<(k: string, f: string, v: string | number) => RedisPipeline>;
  exec: jest.Mock<() => Promise<unknown[]>>;
}

/**
 * RedisMock: A class that simulates the behavior of an ioredis instance.
 * It uses internal storage to keep data during tests.
 */
export class RedisMock {
  private storage: Record<string, Record<string, string>> = {};

  // Mocking the pipeline for method chaining
  pipeline(): RedisPipeline {
    const pipelineObj: RedisPipeline = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rpush: jest.fn<(...args: any[]) => RedisPipeline>().mockImplementation(() => pipelineObj),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      lpush: jest.fn<(...args: any[]) => RedisPipeline>().mockImplementation(() => pipelineObj),
      ltrim: jest.fn<(k: string, s: number, e: number) => RedisPipeline>().mockImplementation(() => pipelineObj),
      expire: jest.fn<(k: string, s: number) => RedisPipeline>().mockImplementation(() => pipelineObj),
      hincrbyfloat: jest.fn<(k: string, f: string, v: number) => RedisPipeline>().mockImplementation((k, f, v) => {
        this.hincrbyfloat(k, f, v);
        return pipelineObj;
      }),
      hincrby: jest.fn<(k: string, f: string, v: number) => RedisPipeline>().mockImplementation((k, f, v) => {
        this.hincrby(k, f, v);
        return pipelineObj;
      }),
      hset: jest.fn<(k: string, f: string, v: string | number) => RedisPipeline>().mockImplementation((k, f, v) => {
        this.hset(k, f, v);
        return pipelineObj;
      }),
      exec: jest.fn<() => Promise<unknown[]>>().mockResolvedValue([]),
    };
    return pipelineObj;
  }

  async hincrbyfloat(key: string, field: string, value: number): Promise<number> {
    if (!this.storage[key]) this.storage[key] = {};
    const current = parseFloat(this.storage[key][field] || "0");
    const newValue = current + value;
    this.storage[key][field] = newValue.toString();
    return newValue;
  }

  async hincrby(key: string, field: string, value: number): Promise<number> {
    if (!this.storage[key]) this.storage[key] = {};
    const current = parseInt(this.storage[key][field] || "0", 10);
    const newValue = current + value;
    this.storage[key][field] = newValue.toString();
    return newValue;
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    return this.storage[key] || {};
  }

  async set(key: string, value: string): Promise<string> {
    this.storage[key] = { value };
    return "OK";
  }

  async get(key: string): Promise<string | null> {
    return this.storage[key]?.value || null;
  }

  async del(key: string): Promise<number> {
    if (this.storage[key]) {
      delete this.storage[key];
      return 1;
    }
    return 0;
  }

  async keys(pattern: string): Promise<string[]> {
    const regexStr = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\?/g, '.')
      .replace(/\*/g, '.*');
    const regex = new RegExp("^" + regexStr + "$");
    return Object.keys(this.storage).filter(k => regex.test(k));
  }

  async hset(key: string, field: string, value: string | number): Promise<number> {
    if (!this.storage[key]) this.storage[key] = {};
    this.storage[key][field] = value.toString();
    return 1;
  }

  async quit(): Promise<string> {
    return "OK";
  }

  on(): void {}
}
