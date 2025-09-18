/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { AgentRepository } from '../agent-repository';

export function createAgentRepositoryMock(): jest.Mocked<AgentRepository> {
  return {
    create: jest.fn(),
    delete: jest.fn(),
    execute: jest.fn(),
    getActive: jest.fn(),
    register: jest.fn(),
    findByModelId: jest.fn(),
    deleteByModelId: jest.fn(),
  };
}
