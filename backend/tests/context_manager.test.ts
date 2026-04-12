import { ContextManager } from '@/helpers/contextManager.js';
import { SystemMessage, HumanMessage, AIMessage, BaseMessage } from '@langchain/core/messages';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { jest } from '@jest/globals';

describe('ContextManager', () => {
  let mockModel: any;

  beforeEach(() => {
    // Usamos any para el mock para facilitar la configuración de getNumTokens
    mockModel = {
      getNumTokens: jest.fn(),
      // Necesario para que trimMessages lo reconozca como un token counter válido
      _getType: () => 'base_chat_model'
    };
  });

  it('no debe recortar mensajes si el total de tokens es menor al límite', async () => {
    const messages = [
      new SystemMessage('Eres un asistente'),
      new HumanMessage('Hola'),
      new AIMessage('Hola, ¿en qué te ayudo?')
    ];

    // Simulamos que el total de tokens es 100 (menor a 4096)
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

    // Mockeamos getNumTokens para que simule que con todos se pasa, pero sin msg1 entra
    mockModel.getNumTokens.mockImplementation(async (text: string) => {
      if (text.includes('muy largo')) return 5000; // Simula exceso
      return 100; // Entra
    });

    const result = await ContextManager.trim(messages, mockModel as unknown as BaseChatModel);

    // Debería tener el System y los últimos mensajes
    expect(result[0].content).toBe('System');
    expect(result.some(m => m.content === 'Mensaje actual')).toBe(true);
    // Nota: LangChain's trimMessages es inteligente, verificamos que el resultado sea coherente
    expect(result.length).toBeLessThan(messages.length);
  });
});
