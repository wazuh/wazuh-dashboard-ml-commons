/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ModelRepository } from '../model-repository';

export function createModelRepositoryMock(): jest.Mocked<ModelRepository> {
  return {
    create: jest.fn(),
    getAll: jest.fn(),
    delete: jest.fn(),
    findById: jest.fn(),
    validateConnection: jest.fn(),
    deploy: jest.fn(),
  };
}
