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

import { RegisterAgentStep } from './register-agent-step';
import { InstallationContext } from '../../domain/entities/installation-context';
import type { InstallAIDashboardAssistantDto } from '../../domain/types/install-ai-dashboard-assistant-dto';

describe('RegisterAgentStep', () => {
  const req: InstallAIDashboardAssistantDto = {
    selected_provider: 'OpenAI',
    model_id: 'gpt-4o',
    api_url: 'https://api.openai.com',
    api_key: 'sk',
  };

  it('uses agent from context', async () => {
    const useAgent = jest.fn().mockResolvedValue(undefined);
    ((global as unknown) as {
      __mockUseCases: import('../../../../services/__mocks__').MockUseCases;
    }).__mockUseCases = { useAgent };
    const step = new RegisterAgentStep();
    const ctx = new InstallationContext();
    ctx.set('agentId', 'agent-1');
    await expect(step.execute(req, ctx)).resolves.toBeUndefined();
    expect(useAgent).toHaveBeenCalledWith('agent-1');
  });
});
