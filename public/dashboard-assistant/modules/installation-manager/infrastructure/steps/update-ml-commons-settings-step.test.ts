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

import { UpdateMlCommonsSettingsStep } from './update-ml-commons-settings-step';
import { InstallationContext } from '../../domain/entities/installation-context';
import type { InstallAIDashboardAssistantDto } from '../../domain/types/install-ai-dashboard-assistant-dto';

describe('UpdateMlCommonsSettingsStep', () => {
  const baseReq: InstallAIDashboardAssistantDto = {
    selected_provider: 'OpenAI',
    model_id: 'gpt-4o',
    api_url: 'https://api.openai.com',
    api_key: 'sk',
  };

  it('persists ML settings using provider regex', async () => {
    const step = new UpdateMlCommonsSettingsStep();
    ((global as unknown) as {
      __mockUseCases: import('../../../../services/__mocks__').MockUseCases;
    }).__mockUseCases = {
      persistMlCommonsSettings: jest.fn().mockResolvedValue(undefined),
    };
    await step.execute(baseReq, new InstallationContext());
    expect(
      ((global as unknown) as {
        __mockUseCases: import('../../../../services/__mocks__').MockUseCases;
      }).__mockUseCases!.persistMlCommonsSettings
    ).toHaveBeenCalledWith({
      endpoints_regex: [expect.any(String)],
    });
    expect(step.getSuccessMessage()).toMatch(/updated successfully/);
  });

  it('fails on unknown provider with explicit error', async () => {
    const step = new UpdateMlCommonsSettingsStep();
    ((global as unknown) as {
      __mockUseCases: import('../../../../services/__mocks__').MockUseCases;
    }).__mockUseCases = { persistMlCommonsSettings: jest.fn() };
    await expect(
      step.execute({ ...baseReq, selected_provider: 'Unknown' }, new InstallationContext())
    ).rejects.toThrow(/Unknown provider/);
    expect(step.getFailureMessage()).toMatch(/Failed to update ML Commons/);
  });
});
