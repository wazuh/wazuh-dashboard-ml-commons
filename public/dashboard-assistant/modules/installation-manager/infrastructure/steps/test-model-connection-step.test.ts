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
    ((global as unknown) as {
      __mockUseCases: import('../../../../services/__mocks__').MockUseCases;
    }).__mockUseCases = {
      validateModelConnection: jest.fn().mockResolvedValue(true),
    };
    const step = new TestModelConnectionStep();
    const ctx = new InstallationContext();
    ctx.set('modelId', 'm-1');
    await expect(step.execute(req, ctx)).resolves.toBeUndefined();
    expect(step.getSuccessMessage()).toMatch(/tested successfully/);
  });

  it('throws when validation returns false', async () => {
    ((global as unknown) as {
      __mockUseCases: import('../../../../services/__mocks__').MockUseCases;
    }).__mockUseCases = {
      validateModelConnection: jest.fn().mockResolvedValue(false),
    };
    const step = new TestModelConnectionStep();
    const ctx = new InstallationContext();
    ctx.set('modelId', 'm-1');
    await expect(step.execute(req, ctx)).rejects.toThrow(
      /"Test Model Connection" step failed while validating the model connection/
    );
    expect(step.getFailureMessage()).toMatch(/Failed to test model connection/);
  });

  it('enriches errors with possible causes when API key is invalid', async () => {
    const apiError = new Error('Unauthorized');
    (apiError as { status?: number }).status = 401;

    ((global as unknown) as {
      __mockUseCases: import('../../../../services/__mocks__').MockUseCases;
    }).__mockUseCases = {
      validateModelConnection: jest.fn().mockRejectedValue(apiError),
    };

    const step = new TestModelConnectionStep();
    const ctx = new InstallationContext();
    ctx.set('modelId', 'm-1');

    await expect(step.execute(req, ctx)).rejects.toThrow(
      /Possible causes: Verify the API key; it may be incorrect or lack permissions\./
    );
  });
});
