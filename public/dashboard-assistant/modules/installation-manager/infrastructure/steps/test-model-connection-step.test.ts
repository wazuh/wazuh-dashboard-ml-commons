jest.mock('../../../../services/ml-use-cases.service', () => ({
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  getUseCases: () =>
    (
      global as unknown as {
        __mockUseCases: import('../../../../services/__mocks__').MockUseCases;
      }
    ).__mockUseCases,
}));

import { TestModelConnectionStep } from './test-model-connection-step';
import { InstallationContext } from '../../domain/entities/installation-context';
import type { InstallAIDashboardAssistantDto } from '../../domain/types/install-ai-dashboard-assistant-dto';

describe('TestModelConnectionStep', () => {
  const req: InstallAIDashboardAssistantDto = {
    selected_provider: 'OpenAI',
    model_id: 'gpt-4o',
    api_url: 'https://api.openai.com',
    api_key: 'sk',
  };

  it('succeeds when validation returns true', async () => {
    (
      global as unknown as {
        __mockUseCases: import('../../../../services/__mocks__').MockUseCases;
      }
    ).__mockUseCases = {
      validateModelConnection: jest.fn().mockResolvedValue(true),
    };
    const step = new TestModelConnectionStep();
    const ctx = new InstallationContext();
    ctx.set('modelId', 'm-1');
    await expect(step.execute(req, ctx)).resolves.toBeUndefined();
    expect(step.getSuccessMessage()).toMatch(/tested successfully/);
  });

  it('throws when validation returns false', async () => {
    (
      global as unknown as {
        __mockUseCases: import('../../../../services/__mocks__').MockUseCases;
      }
    ).__mockUseCases = {
      validateModelConnection: jest.fn().mockResolvedValue(false),
    };
    const step = new TestModelConnectionStep();
    const ctx = new InstallationContext();
    ctx.set('modelId', 'm-1');
    await expect(step.execute(req, ctx)).rejects.toThrow(
      'Failed to connect to model',
    );
    expect(step.getFailureMessage()).toMatch(/Failed to test model connection/);
  });
});
