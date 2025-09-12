/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { deleteModelWithRelatedEntitiesUseCase } from './delete-model-with-related-entities';
import { createModelRepositoryMock } from '../ports/__mocks__/model-repository';
import { createConnectorRepositoryMock } from '../../../connector/application/ports/__mocks__/connector-repository';
import { createAgentRepositoryMock } from '../../../agent/application/ports/__mocks__/agent-repository';

describe('deleteModelWithRelatedEntitiesUseCase', () => {
  it('deletes model and related entities when found', async () => {
    const modelRepo = createModelRepositoryMock();
    const connectorRepo = createConnectorRepositoryMock();
    const agentRepo = createAgentRepositoryMock();
    const model = {
      id: 'm1',
      name: 'N',
      function_name: 'remote',
      model_group_id: 'g1',
      connector_id: 'c1',
      description: 'd',
      version: '1',
      status: 'ACTIVE',
      created_at: 'now',
    } as any;
    modelRepo.findById.mockResolvedValueOnce(model);
    const run = deleteModelWithRelatedEntitiesUseCase(
      modelRepo,
      connectorRepo,
      { delete: jest.fn() } as any,
      agentRepo
    );
    await run('m1');
    expect(modelRepo.delete).toHaveBeenCalledWith('m1');
    expect(connectorRepo.delete).toHaveBeenCalledWith('c1');
    expect(agentRepo.deleteByModelId).toHaveBeenCalledWith('m1');
  });

  it('throws if model not found', async () => {
    const modelRepo = createModelRepositoryMock();
    const connectorRepo = createConnectorRepositoryMock();
    const agentRepo = createAgentRepositoryMock();
    modelRepo.findById.mockResolvedValueOnce(null);
    const run = deleteModelWithRelatedEntitiesUseCase(
      modelRepo,
      connectorRepo,
      { delete: jest.fn() } as any,
      agentRepo
    );
    await expect(run('m1')).rejects.toThrow('Model not found');
  });
});
