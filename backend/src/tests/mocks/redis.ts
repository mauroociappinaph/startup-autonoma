import { jest } from "@jest/globals";

/**
 * Centralized Redis Mock for Testing.
 * Eliminates duplication and ensures consistent behavior across the suite.
 * Follows the "Zero Any" policy (Issue #183).
 */

interface RedisStorage {
  [key: string]: Record<string, string>;
}

interface RedisPipeline {
  rpush: ReturnType<typeof jest.fn>;
  lpush: ReturnType<typeof jest.fn>;
  ltrim: ReturnType<typeof jest.fn>;
  expire: ReturnType<typeof jest.fn>;
  hincrbyfloat: ReturnType<typeof jest.fn>;
  hincrby: ReturnType<typeof jest.fn>;
  hset: ReturnType<typeof jest.fn>;
  exec: ReturnType<typeof jest.fn>;
}

class RedisMock {
  private storage: RedisStorage = {};

  pipeline(): RedisPipeline {
    const pipelineObj: RedisPipeline = {
      rpush: jest.fn().mockImplementation(() => pipelineObj),
      lpush: jest.fn().mockImplementation(() => pipelineObj),
      ltrim: jest.fn().mockImplementation(() => pipelineObj),
      expire: jest.fn().mockImplementation(() => pipelineObj),
      hincrbyfloat: jest.fn().mockImplementation((k: unknown, f: unknown, v: unknown) => {
        this.hincrbyfloat(k as string, f as string, v as number);
        return pipelineObj;
      }),
      hincrby: jest.fn().mockImplementation((k: unknown, f: unknown, v: unknown) => {
        this.hincrby(k as string, f as string, v as number);
        return pipelineObj;
      }),
      hset: jest.fn().mockImplementation((k: unknown, f: unknown, v: unknown) => {
        this.hset(k as string, f as string, v as string | number);
        return pipelineObj;
      }),
      exec: jest.fn().mockResolvedValue([] as never),
    };
    return pipelineObj;
  }

  hincrbyfloat(key: string, field: string, value: number): Promise<number> {
    if (!this.storage[key]) this.storage[key] = {};
    const current = parseFloat(this.storage[key][field] || "0");
    const newValue = current + value;
    this.storage[key][field] = newValue.toString();
    return Promise.resolve(newValue);
  }

  hincrby(key: string, field: string, value: number): Promise<number> {
    if (!this.storage[key]) this.storage[key] = {};
    const current = parseInt(this.storage[key][field] || "0", 10);
    const newValue = current + value;
    this.storage[key][field] = newValue.toString();
    return Promise.resolve(newValue);
  }

  hgetall(key: string): Promise<Record<string, string>> {
    return Promise.resolve(this.storage[key] || {});
  }

  set(key: string, value: string | number): Promise<"OK"> {
    this.storage[key] = { value: value.toString() };
    return Promise.resolve("OK");
  }

  get(key: string): Promise<string | null> {
    return Promise.resolve(this.storage[key]?.value || null);
  }

  publish(): Promise<number> {
    return Promise.resolve(1);
  }

  rpush(): this {
    return this;
  }

  lpush(): Promise<number> {
    return Promise.resolve(1);
  }

  ltrim(): Promise<"OK"> {
    return Promise.resolve("OK");
  }

  lrange(): Promise<string[]> {
    return Promise.resolve([]);
  }

  expire(): this {
    return this;
  }

  on(): void {}

  quit(): Promise<"OK"> {
    return Promise.resolve("OK");
  }

  del(key: string): Promise<number> {
    const exists = this.storage[key] ? 1 : 0;
    delete this.storage[key];
    return Promise.resolve(exists);
  }

  keys(pattern: string): Promise<string[]> {
    const regexStr = pattern
      .replace(/[.+^${}()|[\]\\]/g, "\\$&")
      .replace(/\?/g, ".")
      .replace(/\*/g, ".*");
    const regex = new RegExp("^" + regexStr + "$");
    return Promise.resolve(Object.keys(this.storage).filter((k) => regex.test(k)));
  }

  hset(key: string, field: string, value: string | number): Promise<number> {
    if (!this.storage[key]) this.storage[key] = {};
    this.storage[key][field] = value.toString();
    return Promise.resolve(1);
  }

  // Helper to reset state between tests
  flushall(): void {
    this.storage = {};
  }
}

export const mockRedis = new RedisMock();

// Factory for Jest mocking
export const createRedisMock = () => ({
  Redis: jest.fn().mockImplementation(() => mockRedis),
  default: jest.fn().mockImplementation(() => mockRedis),
});
