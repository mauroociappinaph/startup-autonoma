import { test_runner_node } from '@/nodes/workers/test_runner_node.js';
import { test_runner } from '@/tools/domain/software/testRunner.js';
import { AIMessage } from '@langchain/core/messages';
import { AgentStateType } from '@startup/shared';

describe('Test Runner Node', () => {


  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('debería ejecutar tests exitosamente y devolver reporte de éxito', async () => {
    const runnerSpy = jest.spyOn(test_runner, 'invoke').mockResolvedValue({
      success: true,
      summary: 'Tests: 5 passed, 5 total',
      commandExecuted: 'npm test',
      stdout: 'All tests passed',
      stderr: ''
    });

    const state = {
      messages: [new AIMessage({
        content: 'Test',
        additional_kwargs: {
          worker_instruction: {
            action: 'test_operation',
            payload: {
              package: 'backend',
              filter: 'git_worker'
            },
            reasoning: 'Testing the test runner'
          }
        }
      })]
    } as unknown as AgentStateType;

    const result = await test_runner_node(state);

    expect(result.executive_summary).toContain('Validación exitosa');
    expect(result.messages?.[0].content).toContain('Tests: 5 passed, 5 total');
    expect(runnerSpy).toHaveBeenCalled();
  });

  it('debería manejar fallos en la suite de tests', async () => {
    const runnerSpy = jest.spyOn(test_runner, 'invoke').mockResolvedValue({
      success: false,
      summary: 'Tests: 1 failed, 4 passed, 5 total',
      commandExecuted: 'npm test',
      stdout: '',
      stderr: 'Test failed at line 10'
    });

    const state = {
      messages: [new AIMessage({
        content: 'Test Failure',
        additional_kwargs: {
          worker_instruction: {
            action: 'test_operation',
            payload: {
              package: 'backend'
            },
            reasoning: 'Testing failure case'
          }
        }
      })]
    } as unknown as AgentStateType;

    const result = await test_runner_node(state);

    expect(result.executive_summary).toContain('Validación fallida');
    expect(result.messages?.[0].content).toContain('Tests: 1 failed, 4 passed, 5 total');
    expect(runnerSpy).toHaveBeenCalled();
  });
});
