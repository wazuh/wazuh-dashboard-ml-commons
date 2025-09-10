/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { composeModelsWithAgentDataUseCase } from './compose-models-with-agent-data';
import { createModelRepositoryMock } from '../ports/__mocks__/model-repository';
import { createAgentRepositoryMock } from '../../../agent/application/ports/__mocks__/agent-repository';
import { ModelStatus } from '../../domain/enums/model-status';

describe('composeModelsWithAgentDataUseCase', () => {
  it('returns table rows with inUse flag and status computed', async () => {
    const modelRepo = createModelRepositoryMock();
    const agentRepo = createAgentRepositoryMock();
    modelRepo.getAll.mockResolvedValueOnce([
      {
        id: 'm1',
        name: 'A',
        version: '1',
        status: ModelStatus.ACTIVE,
        created_at: 'now',
        connector_id: 'c',
        function_name: 'remote',
        description: 'd',
      } as any,
      {
        id: 'm2',
        name: 'B',
        version: '1',
        status: ModelStatus.ACTIVE,
        created_at: 'now',
        connector_id: 'c',
        function_name: 'remote',
        description: 'd',
      } as any,
    ]);
    agentRepo.findByModelId.mockImplementation(async (modelId: string) =>
      modelId === 'm1' ? ({ id: 'a1', name: 'Agent' } as any) : null
    );
    agentRepo.getActive.mockResolvedValueOnce('a1');

    const useCase = composeModelsWithAgentDataUseCase(modelRepo, agentRepo);
    const rows = await useCase();
    expect(rows).toEqual([
      expect.objectContaining({
        id: 'm1',
        agentId: 'a1',
        inUse: true,
        status: ModelStatus.ACTIVE,
      }),
      expect.objectContaining({
        id: 'm2',
        agentId: undefined,
        inUse: false,
        status: ModelStatus.INACTIVE,
      }),
    ]);
  });

  it('handles missing agent gracefully', async () => {
    const modelRepo = createModelRepositoryMock();
    const agentRepo = createAgentRepositoryMock();
    modelRepo.getAll.mockResolvedValueOnce([
      {
        id: 'm1',
        name: 'A',
        version: '1',
        status: ModelStatus.ACTIVE,
        created_at: 'now',
        connector_id: 'c',
        function_name: 'remote',
        description: 'd',
      } as any,
    ]);
    agentRepo.findByModelId.mockResolvedValueOnce(null);
    agentRepo.getActive.mockResolvedValueOnce(undefined);
    const useCase = composeModelsWithAgentDataUseCase(modelRepo, agentRepo);
    const rows = await useCase();
    expect(rows[0].agentId).toBeUndefined();
  });
});
