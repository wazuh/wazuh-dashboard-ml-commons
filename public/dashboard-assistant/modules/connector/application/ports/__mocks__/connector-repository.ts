/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ConnectorRepository } from '../connector-repository';

export function createConnectorRepositoryMock(): jest.Mocked<ConnectorRepository> {
  return ({
    create: jest.fn(),
    delete: jest.fn(),
  } as unknown) as jest.Mocked<ConnectorRepository>;
}
