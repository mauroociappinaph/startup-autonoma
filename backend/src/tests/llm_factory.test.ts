/* eslint-disable @typescript-eslint/no-explicit-any */

import { LLMFactory } from '@/services/llmFactory.js';
import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatGroq } from '@langchain/groq';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

import { jest, describe, beforeEach, afterAll, it, expect } from '@jest/globals';

// Mockeamos ioredis para evitar conexiones reales
jest.mock('ioredis', () => {
  const MockRedis = jest.fn().mockImplementation(() => ({
    pipeline: (jest.fn() as any).mockReturnThis(),
    hincrbyfloat: (jest.fn() as any).mockReturnThis(),
    hincrby: (jest.fn() as any).mockReturnThis(),
    exec: (jest.fn() as any).mockResolvedValue([]),
    hgetall: (jest.fn() as any).mockResolvedValue({}),
    set: (jest.fn() as any).mockResolvedValue("OK"),
    get: (jest.fn() as any).mockResolvedValue(null),
    on: jest.fn() as any,
    quit: (jest.fn() as any).mockResolvedValue("OK")
  }));
  return {
    Redis: MockRedis,
    default: MockRedis
  };
});

describe('LLMFactory', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('debe devolver el proveedor correcto para tareas "smart" basado en env', () => {
    process.env.PRIMARY_SMART_PROVIDER = 'openai';
    const provider = LLMFactory.getProviderForType('smart');
    expect(provider).toBe('openai');
  });

  it('debe devolver el proveedor correcto para tareas "fast" basado en env', () => {
    process.env.PRIMARY_FAST_PROVIDER = 'groq';
    const provider = LLMFactory.getProviderForType('fast');
    expect(provider).toBe('groq');
  });

  it('debe usar "nvidia" como default si no hay env configurado', () => {
    delete process.env.PRIMARY_SMART_PROVIDER;
    delete process.env.PRIMARY_FAST_PROVIDER;
    const provider = LLMFactory.getProviderForType('smart');
    expect(provider).toBe('nvidia');
  });

  it('debe crear una instancia de ChatOpenAI cuando el proveedor es openai', () => {
    process.env.PRIMARY_SMART_PROVIDER = 'openai';
    process.env.OPENAI_API_KEY = 'test-key';
    const model = LLMFactory.createModel({ type: 'smart' });
    expect(model).toBeInstanceOf(ChatOpenAI);
  });

  it('debe crear una instancia de ChatAnthropic cuando el proveedor es anthropic', () => {
    process.env.PRIMARY_SMART_PROVIDER = 'anthropic';
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const model = LLMFactory.createModel({ type: 'smart' });
    expect(model).toBeInstanceOf(ChatAnthropic);
  });

  it('debe crear una instancia de ChatGroq cuando el proveedor es groq', () => {
    process.env.PRIMARY_FAST_PROVIDER = 'groq';
    process.env.GROQ_API_KEY = 'test-key';
    const model = LLMFactory.createModel({ type: 'fast' });
    expect(model).toBeInstanceOf(ChatGroq);
  });

  it('debe crear una instancia de ChatGoogleGenerativeAI cuando el proveedor es google', () => {
    process.env.PRIMARY_SMART_PROVIDER = 'google';
    process.env.GOOGLE_API_KEY = 'test-key';
    const model = LLMFactory.createModel({ type: 'smart' });
    expect(model).toBeInstanceOf(ChatGoogleGenerativeAI);
  });
});
