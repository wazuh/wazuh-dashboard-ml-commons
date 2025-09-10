/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { AgentRepository } from '../ports/agent-repository';

export const registerAgentUseCase = (agentRepository: AgentRepository) => async (
  agentId: string
): Promise<void> => {
  await agentRepository.register(agentId);

  // Wait for 1 second to ensure the changes are propagated
  await new Promise((resolve) => setTimeout(resolve, 1000));
};
