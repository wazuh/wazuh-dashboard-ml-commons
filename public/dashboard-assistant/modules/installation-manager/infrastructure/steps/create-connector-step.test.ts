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

import { CreateConnectorStep } from './create-connector-step';
import { InstallationContext } from '../../domain/entities/installation-context';
import type { InstallAIDashboardAssistantDto } from '../../domain/types/install-ai-dashboard-assistant-dto';

describe('CreateConnectorStep', () => {
  const baseReq: InstallAIDashboardAssistantDto = {
    selected_provider: 'OpenAI',
    model_id: 'gpt-4o',
    api_url: 'https://api.openai.com',
    api_key: 'sk-test',
    description: 'desc',
  };

  it('builds DTO from provider config and stores connectorId', async () => {
    const step = new CreateConnectorStep();
    const ctx = new InstallationContext();
    ((global as unknown) as {
      __mockUseCases: import('../../../../services/__mocks__').MockUseCases;
    }).__mockUseCases = {
      createConnector: jest.fn().mockResolvedValue({ id: 'conn-1' }),
    };
    await step.execute(baseReq, ctx);
    expect(
      ((global as unknown) as {
        __mockUseCases: import('../../../../services/__mocks__').MockUseCases;
      }).__mockUseCases!.createConnector
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'OpenAI Chat Connector',
        endpoint: 'https://api.openai.com',
        model_id: 'gpt-4o',
        headers: expect.any(Object),
        url_path: expect.any(String),
      })
    );
    expect(ctx.get('connectorId')).toBe('conn-1');
  });

  it('throws on unknown provider', async () => {
    const step = new CreateConnectorStep();
    const ctx = new InstallationContext();
    const req = { ...baseReq, selected_provider: 'Unknown' };
    ((global as unknown) as {
      __mockUseCases: import('../../../../services/__mocks__').MockUseCases;
    }).__mockUseCases = { createConnector: jest.fn() };
    await expect(step.execute(req, ctx)).rejects.toThrow(/Unknown provider/);
  });
});
