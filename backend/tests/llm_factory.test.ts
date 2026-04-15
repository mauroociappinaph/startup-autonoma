import { LLMFactory } from '@/services/llmFactory.js';
import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatGroq } from '@langchain/groq';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

describe('LLMFactory', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
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
