/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Connector } from '../../../domain/entities/connector';

export interface ConnectorOpenSearchCreateDto
  extends Pick<
    Connector,
    'name' | 'description' | 'version' | 'protocol' | 'parameters' | 'actions'
  > {
  credential: Record<string, string>;
}
