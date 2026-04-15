import { ContextManager } from '@/helpers/contextManager.js';
import { SystemMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { jest } from '@jest/globals';

describe('ContextManager', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockModel: any;

  beforeEach(() => {
    mockModel = {
      getNumTokens: jest.fn(),
      _getType: () => 'base_chat_model'
    };
  });

  it('no debe recortar mensajes si el total de tokens es menor al límite', async () => {
    const messages = [
      new SystemMessage('Eres un asistente'),
      new HumanMessage('Hola'),
      new AIMessage('Hola, ¿en qué te ayudo?')
    ];

    mockModel.getNumTokens.mockResolvedValue(100);

    const result = await ContextManager.trim(messages, mockModel as unknown as BaseChatModel);

    expect(result.length).toBe(3);
    expect(result[0]).toBeInstanceOf(SystemMessage);
  });

  it('debe recortar mensajes viejos pero mantener el SystemMessage cuando excede el límite', async () => {
    const system = new SystemMessage('System');
    const msg1 = new HumanMessage('Mensaje muy largo 1');
    const msg2 = new AIMessage('Respuesta 1');
    const msg3 = new HumanMessage('Mensaje actual');

    const messages = [system, msg1, msg2, msg3];

    mockModel.getNumTokens.mockImplementation(async (text: string) => {
      if (text.includes('muy largo')) return 5000;
      return 100;
    });

    const result = await ContextManager.trim(messages, mockModel as unknown as BaseChatModel);

    expect(result[0].content).toBe('System');
    expect(result.some(m => m.content === 'Mensaje actual')).toBe(true);
    expect(result.length).toBeLessThan(messages.length);
  });
});
