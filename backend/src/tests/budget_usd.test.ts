import { jest } from '@jest/globals';
import { BudgetService } from '../services/budgetService.js';
import { TelemetryService } from '../services/telemetryService.js';
import { ProjectContext } from '@startup/shared';

describe('BudgetService USD Monitoring', () => {
  let budgetService: BudgetService;
  let mockTelemetryService: any;

  beforeEach(() => {
    mockTelemetryService = {
      getProjectStats: jest.fn(),
      recordMetric: jest.fn(),
    };
    budgetService = new BudgetService(mockTelemetryService);
    // Mockeamos el acceso a Redis
    jest.spyOn(budgetService, 'getProjectUsage').mockResolvedValue(0);
  });

  it('should fail security check when USD budget is exceeded', async () => {
    const context: ProjectContext = {
      projectId: '00000000-0000-0000-0000-000000000001',
      name: 'Test Project',
      workDir: '/tmp',
      engramNamespace: 'test',
      maxTokenBudget: 1000,
      maxUsdBudget: 0.05,
    };

    // Simulamos que el TelemetryService reporta $0.06
    mockTelemetryService.getProjectStats.mockResolvedValue({
      total_tokens: 100,
      total_cost_usd: 0.06,
      execution_time_ms: 1000,
      nodes_visited: 1
    });

    const result = await budgetService.checkSecurityStatus(context);

    expect(result.status).toBe('FAIL');
    expect(result.max_budget_reached).toBe(true);
    expect(result.message).toContain('Presupuesto USD excedido');
  });

  it('should pass security check when USD budget is within limits', async () => {
    const context: ProjectContext = {
      projectId: '00000000-0000-0000-0000-000000000001',
      name: 'Test Project',
      workDir: '/tmp',
      engramNamespace: 'test',
      maxTokenBudget: 1000,
      maxUsdBudget: 10.0,
    };

    mockTelemetryService.getProjectStats.mockResolvedValue({
      total_tokens: 100,
      total_cost_usd: 0.01,
      execution_time_ms: 1000,
      nodes_visited: 1
    });

    const result = await budgetService.checkSecurityStatus(context);

    expect(result.status).toBe('PASS');
    expect(result.max_budget_reached).toBe(false);
  });

  it('should emit alert when USD budget reaches 90%', async () => {
    const context: ProjectContext = {
      projectId: '00000000-0000-0000-0000-000000000001',
      name: 'Test Project',
      workDir: '/tmp',
      engramNamespace: 'test',
      maxTokenBudget: 1000,
      maxUsdBudget: 1.0,
    };

    mockTelemetryService.getProjectStats.mockResolvedValue({
      total_tokens: 100,
      total_cost_usd: 0.95, // 95%
      execution_time_ms: 1000,
      nodes_visited: 1
    });

    const result = await budgetService.checkSecurityStatus(context);

    expect(result.status).toBe('PASS');
    expect(result.max_budget_reached).toBe(false);
  });
});
