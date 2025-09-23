/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { triggerAIAssistantInstaller } from './trigger-ai-assistant-installer';

describe('installDashboardAssistantUseCase', () => {
  it('returns success with data when orchestrator resolves', async () => {
    const data = { agentId: 'agent-1', modelId: 'model-1' };
    const execute = jest.fn().mockResolvedValue({
      success: true,
      message: 'Dashboard assistant installed successfully',
      data,
    });
    const orchestrator = { execute } as any;

    const useCase = triggerAIAssistantInstaller(orchestrator);
    const request = { any: 'payload' } as any;

    const res = await useCase(request);

    expect(execute).toHaveBeenCalledWith(request);
    expect(res.success).toBe(true);
    expect(typeof res.message).toBe('string');
    expect(res.message).toBeTruthy();
    expect(res.data).toEqual(data);
  });

  it('returns failure payload with rollbacks when orchestrator reports failure', async () => {
    const execute = jest.fn().mockResolvedValue({
      success: false,
      message: 'Installation failed during step "Create Model"',
      data: {},
      rollbacks: [{ step: 'Create Connector' }, { step: 'Persist ML Commons settings' }],
    });
    const orchestrator = { execute } as any;

    const useCase = triggerAIAssistantInstaller(orchestrator);
    const res = await useCase({} as any);

    expect(res.success).toBe(false);
    expect(res.message).toContain('Create Model');
    expect(res.rollbacks).toEqual(['Create Connector', 'Persist ML Commons settings']);
  });

  it('returns failure with error message when orchestrator throws Error', async () => {
    const execute = jest.fn().mockRejectedValue(new Error('boom'));
    const orchestrator = { execute } as any;

    const useCase = triggerAIAssistantInstaller(orchestrator);
    const res = await useCase({} as any);

    expect(res.success).toBe(false);
    expect(res.message).toContain('boom');
  });

  it('returns failure with fallback message when orchestrator throws non-Error', async () => {
    const execute = jest.fn().mockRejectedValue('bad');
    const orchestrator = { execute } as any;

    const useCase = triggerAIAssistantInstaller(orchestrator);
    const res = await useCase({} as any);

    expect(res.success).toBe(false);
    expect(typeof res.message).toBe('string');
    expect(res.message.length).toBeGreaterThan(0);
  });
});
