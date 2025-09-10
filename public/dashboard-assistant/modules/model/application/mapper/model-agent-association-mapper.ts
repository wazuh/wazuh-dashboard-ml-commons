/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Agent } from '../../../agent/domain/entities/agent';
import type { Model } from '../../domain/entities/model';
import { ModelWithAgentData } from '../../domain/entities/model-with-agent-data';
import { ModelStatus } from '../../domain/enums/model-status';

export class ModelAgentAssociationMapper {
  public static toTableData(
    models: Array<[Model, Agent | null]>,
    activeAgentId?: string
  ): ModelWithAgentData[] {
    return models.map(([model, agent]) => ({
      name: model.name,
      id: model.id,
      version: model.version,
      status: !agent?.id ? ModelStatus.INACTIVE : model.status,
      createdAt: model.created_at,
      agentId: agent?.id,
      agentName: agent?.name,
      inUse: agent?.id === activeAgentId,
    }));
  }
}
