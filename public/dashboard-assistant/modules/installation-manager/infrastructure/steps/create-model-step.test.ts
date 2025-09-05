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

import { CreateModelStep } from './create-model-step';
import { InstallationContext } from '../../domain/entities/installation-context';
import type { InstallAIDashboardAssistantDto } from '../../domain/types/install-ai-dashboard-assistant-dto';

describe('CreateModelStep', () => {
  const baseReq: InstallAIDashboardAssistantDto = {
    selected_provider: 'OpenAI',
    model_id: 'gpt-4o',
    api_url: 'https://api.openai.com',
    api_key: 'sk',
    description: 'opt',
  };

  it('creates model from connectorId and stores modelId', async () => {
    ((global as unknown) as {
      __mockUseCases: import('../../../../services/__mocks__').MockUseCases;
    }).__mockUseCases = {
      createModel: jest.fn().mockResolvedValue({ id: 'm-1' }),
    };
    const step = new CreateModelStep();
    const ctx = new InstallationContext();
    ctx.set('connectorId', 'conn-1');
    await step.execute(baseReq, ctx);
    expect(
      ((global as unknown) as {
        __mockUseCases: import('../../../../services/__mocks__').MockUseCases;
      }).__mockUseCases!.createModel
    ).toHaveBeenCalledWith({
      connector_id: 'conn-1',
      name: 'OpenAI',
      description: 'opt',
    });
    expect(ctx.get('modelId')).toBe('m-1');
  });
});
