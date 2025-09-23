/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ConnectorRepository } from '../ports/connector-repository';

export const deleteConnectorUseCase = (connectorRepository: ConnectorRepository) => async (
  connectorId: string
): Promise<void> => {
  await connectorRepository.delete(connectorId);
};
