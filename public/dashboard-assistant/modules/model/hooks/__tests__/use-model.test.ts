/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { act, renderHook } from '@testing-library/react-hooks';
import { AllTheProviders } from '../../../../../../test/test_utils';
import { useModel } from '../use-model';

jest.useFakeTimers();

// Mock getUseCases() to control polling behavior
type ModelWithAgent = {
  id: string;
  agentId?: string;
  inUse?: boolean;
  version?: string;
  createdAt?: string;
  status?: string;
};
const mockUseAgent = jest.fn();
const mockGetModelsWithAgentData = jest.fn<Promise<ModelWithAgent[]>, []>();

jest.mock('../../../../services/ml-use-cases.service', () => {
  return {
    getUseCases: () => ({
      useAgent: mockUseAgent,
      getModelsWithAgentData: mockGetModelsWithAgentData,
    }),
  };
});

describe('useModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  it('registers the agent, polls until inUse is true, then calls onSuccess', async () => {
    const agentId = 'agent-123';
    mockUseAgent.mockResolvedValueOnce(undefined);
    // First poll: not in use yet
    mockGetModelsWithAgentData.mockResolvedValueOnce([
      { id: 'm1', agentId, inUse: false },
    ] as ModelWithAgent[]);
    // Second poll: now active
    mockGetModelsWithAgentData.mockResolvedValueOnce([
      { id: 'm1', agentId, inUse: true },
    ] as ModelWithAgent[]);

    const onSuccess = jest.fn();
    const { result } = renderHook(() => useModel({ onSuccess }), {
      wrapper: AllTheProviders,
    });

    let p: Promise<void>;
    await act(async () => {
      p = result.current.activateModel(agentId);
    });
    // Let promises resolve so the first delay is scheduled
    await act(async () => {
      await Promise.resolve();
    });
    // Advance the delay between polls for the second check
    await act(async () => {
      jest.advanceTimersByTime(300);
    });
    await act(async () => {
      await p;
    });

    expect(mockUseAgent).toHaveBeenCalledWith(agentId);
    expect(mockGetModelsWithAgentData).toHaveBeenCalledTimes(2);
    expect(onSuccess).toHaveBeenCalled();
  });
});
