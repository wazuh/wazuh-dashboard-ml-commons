/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { AgentRepository } from '../ports/agent-repository';

export const deleteAgentUseCase = (agentRepository: AgentRepository) => async (
  agentId: string
): Promise<void> => {
  await agentRepository.delete(agentId);
};
