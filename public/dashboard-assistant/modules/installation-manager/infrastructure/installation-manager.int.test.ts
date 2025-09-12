/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Integration tests for the InstallationManager orchestration over concrete steps.
 * External use cases are mocked via the services layer.
 */

// Mock the ML use-cases service to isolate from network and repositories
jest.mock('../../../services/ml-use-cases.service', () => ({
  getUseCases: () =>
    ((global as unknown) as {
      __mockUseCases: import('../../../services/__mocks__').MockUseCases;
    }).__mockUseCases,
}));

import { InstallationManager } from './installation-manager';
import type { InstallAIDashboardAssistantDto } from '../domain';

describe('InstallationManager (integration)', () => {
  const request: InstallAIDashboardAssistantDto = {
    selected_provider: 'OpenAI',
    model_id: 'gpt-4o',
    api_url: 'https://api.openai.com',
    api_key: 'sk-test',
    description: 'Test install',
  };

  it('runs all steps successfully and updates context', async () => {
    ((global as unknown) as {
      __mockUseCases: import('../../../services/__mocks__').MockUseCases;
    }).__mockUseCases = {
      persistMlCommonsSettings: jest.fn().mockResolvedValue(undefined),
      createConnector: jest.fn().mockResolvedValue({ id: 'conn-1' }),
      createModel: jest.fn().mockResolvedValue({ id: 'model-1' }),
      validateModelConnection: jest.fn().mockResolvedValue(true),
      createAgent: jest.fn().mockResolvedValue({ id: 'agent-1' }),
      useAgent: jest.fn().mockResolvedValue(undefined),
    };

    const progressUpdates: unknown[] = [];
    const manager = new InstallationManager((p) => progressUpdates.push(p));
    const result = await manager.execute(request);

    expect(result.success).toBe(true);
    expect(result.message).toMatch(/installed successfully/);
    // Ensure some progress updates were emitted
    expect(progressUpdates.length).toBeGreaterThan(0);
    // Final progress should be finished successfully
    const finalProgress = result.progress;
    expect(finalProgress.isFinishedSuccessfully()).toBe(true);
    // Context data should contain derived identifiers
    expect(result.data).toEqual({
      connectorId: 'conn-1',
      modelId: 'model-1',
      agentId: 'agent-1',
    });
  });

  it('captures and returns failure details on step error', async () => {
    ((global as unknown) as {
      __mockUseCases: import('../../../services/__mocks__').MockUseCases;
    }).__mockUseCases = {
      persistMlCommonsSettings: jest.fn().mockResolvedValue(undefined),
      createConnector: jest.fn().mockResolvedValue({ id: 'conn-1' }),
      // Fail on model creation
      createModel: jest.fn().mockRejectedValue(new Error('model error')),
      validateModelConnection: jest.fn(),
      createAgent: jest.fn(),
      useAgent: jest.fn(),
    };

    const manager = new InstallationManager();
    const result = await manager.execute(request);
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors![0]).toMatchObject({ step: 'Create Model' });
    // Data should contain only the connectorId
    expect(result.data).toEqual({ connectorId: 'conn-1' });
  });
});
