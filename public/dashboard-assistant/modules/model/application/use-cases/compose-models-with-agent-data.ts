/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ModelAgentAssociationMapper } from '../mapper/model-agent-association-mapper';
import { ModelRepository } from '../ports/model-repository';
import { AgentRepository } from '../../../agent/application/ports/agent-repository';
import type { Agent } from '../../../agent/domain/entities/agent';
import type { Model } from '../../domain/entities/model';
import type { ModelWithAgentData } from '../../domain/entities/model-with-agent-data';

export const composeModelsWithAgentDataUseCase = (
  modelRepository: ModelRepository,
  agentRepository: AgentRepository
) => {
  const attachAgent = async (model: Model): Promise<[Model, Agent | null]> => {
    const agent = await agentRepository.findByModelId(model.id);
    return [model, agent];
  };

  return async (): Promise<ModelWithAgentData[]> => {
    const models = await modelRepository.getAll();

    const modelsWithAgentAssociations = await Promise.all(
      models.map((model) => attachAgent(model))
    );

    const activeAgentId = await agentRepository.getActive();

    return ModelAgentAssociationMapper.toTableData(modelsWithAgentAssociations, activeAgentId);
  };
};
