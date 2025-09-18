/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CreateRepository, DeleteRepository } from '../../../common/domain/entities/repository';
import { Agent } from '../../domain/entities/agent';
import { CreateAgentDto } from '../dtos/create-agent-dto';

export interface AgentRepository extends CreateRepository<Agent, CreateAgentDto>, DeleteRepository {
  execute(id: string, parameters: any): Promise<any>;
  getActive(): Promise<string | undefined>;
  register(agentId: string): Promise<void>;
  findByModelId(modelId: string): Promise<Agent | null>;
  deleteByModelId(modelId: string): Promise<void>;
}
