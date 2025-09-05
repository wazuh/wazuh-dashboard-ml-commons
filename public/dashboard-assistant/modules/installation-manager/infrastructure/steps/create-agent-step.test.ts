/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

jest.mock('../../../../services/ml-use-cases.service', () => ({
  getUseCases: () =>
    ((global as unknown) as {
      __mockUseCases: import('../../../../services/__mocks__').MockUseCases;
    }).__mockUseCases,
}));

import { CreateAgentStep } from './create-agent-step';
import { InstallationContext } from '../../domain/entities/installation-context';
import type { InstallAIDashboardAssistantDto } from '../../domain/types/install-ai-dashboard-assistant-dto';

describe('CreateAgentStep', () => {
  const req: InstallAIDashboardAssistantDto = {
    selected_provider: 'OpenAI',
    model_id: 'gpt-4o',
    api_url: 'https://api.openai.com',
    api_key: 'sk',
  };

  it('creates agent with modelId from context and stores agentId', async () => {
    ((global as unknown) as {
      __mockUseCases: import('../../../../services/__mocks__').MockUseCases;
    }).__mockUseCases = {
      createAgent: jest.fn().mockResolvedValue({ id: 'agent-1' }),
    };
    const step = new CreateAgentStep();
    const ctx = new InstallationContext();
    ctx.set('modelId', 'm-1');
    await step.execute(req, ctx);
    expect(
      ((global as unknown) as {
        __mockUseCases: import('../../../../services/__mocks__').MockUseCases;
      }).__mockUseCases!.createAgent
    ).toHaveBeenCalledWith(expect.objectContaining({ model_id: 'm-1' }));
    expect(ctx.get('agentId')).toBe('agent-1');
  });

  it('throws if response_filter missing for provider', async () => {
    ((global as unknown) as {
      __mockUseCases: import('../../../../services/__mocks__').MockUseCases;
    }).__mockUseCases = { createAgent: jest.fn() };
    const step = new CreateAgentStep();
    const ctx = new InstallationContext();
    ctx.set('modelId', 'm-1');
    const badReq = { ...req, selected_provider: 'Unknown' };
    await expect(step.execute(badReq, ctx)).rejects.toThrow(/Missing response_filter/);
  });
});
