/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { act, renderHook } from '@testing-library/react-hooks';
import { useModel } from '../use-model';

jest.useFakeTimers();

// Mock getUseCases() to control polling behavior
type ModelWithAgent = { id: string; agentId?: string; inUse?: boolean; version?: string; createdAt?: string; status?: string };
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
    const { result } = renderHook(() => useModel({ onSuccess }));

    await act(async () => {
      const p = result.current.activateModel(agentId);
      // Let first poll run and queue the delay
      await Promise.resolve();
      // Advance the delay between polls
      jest.advanceTimersByTime(300);
      await p;
    });

    expect(mockUseAgent).toHaveBeenCalledWith(agentId);
    expect(mockGetModelsWithAgentData).toHaveBeenCalledTimes(2);
    expect(onSuccess).toHaveBeenCalled();
  });

  it('eventually calls onSuccess even if inUse never becomes true within attempts', async () => {
    const agentId = 'agent-456';
    mockUseAgent.mockResolvedValueOnce(undefined);
    // Always return not active
    mockGetModelsWithAgentData.mockResolvedValue([
      { id: 'm2', agentId, inUse: false },
    ] as ModelWithAgent[]);

    const onSuccess = jest.fn();
    const { result } = renderHook(() => useModel({ onSuccess }));

    await act(async () => {
      const p = result.current.activateModel(agentId);
      // Run through all retry delays (10 attempts * 300ms)
      jest.advanceTimersByTime(300 * 10);
      await p;
    });

    expect(mockUseAgent).toHaveBeenCalledWith(agentId);
    expect(mockGetModelsWithAgentData).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalled();
  });

  it('continues polling if a fetch error occurs and succeeds afterwards', async () => {
    const agentId = 'agent-789';
    mockUseAgent.mockResolvedValueOnce(undefined);
    // First call throws, second returns active
    mockGetModelsWithAgentData.mockRejectedValueOnce(new Error('network'));
    mockGetModelsWithAgentData.mockResolvedValueOnce([
      { id: 'm3', agentId, inUse: true },
    ] as ModelWithAgent[]);

    const onSuccess = jest.fn();
    const { result } = renderHook(() => useModel({ onSuccess }));

    await act(async () => {
      const p = result.current.activateModel(agentId);
      // Allow first failure to settle and then the delay
      await Promise.resolve();
      jest.advanceTimersByTime(300);
      await p;
    });

    expect(mockUseAgent).toHaveBeenCalledWith(agentId);
    expect(mockGetModelsWithAgentData).toHaveBeenCalledTimes(2);
    expect(onSuccess).toHaveBeenCalled();
  });
});

