/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { act, renderHook } from '@testing-library/react-hooks';
import { AllTheProviders } from '../../../../../../test/test_utils';
import { useModel } from '../use-model';

const mockUseAgent = jest.fn();

jest.mock('../../../../services/ml-use-cases.service', () => {
  return {
    getUseCases: () => ({
      useAgent: mockUseAgent,
    }),
  };
});

describe('useModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registra el agente y ejecuta onSuccess', async () => {
    const agentId = 'agent-123';
    mockUseAgent.mockResolvedValueOnce(undefined);

    const onSuccess = jest.fn();
    const { result } = renderHook(() => useModel({ onSuccess }), {
      wrapper: AllTheProviders,
    });

    await act(async () => {
      await result.current.activateModel(agentId);
    });

    expect(mockUseAgent).toHaveBeenCalledWith(agentId);
    expect(onSuccess).toHaveBeenCalled();
  });
});
