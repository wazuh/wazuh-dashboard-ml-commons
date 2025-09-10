/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ConnectorAction } from './connector-action';

export interface Connector {
  id: string;
  name: string;
  description: string;
  version: number;
  protocol: string;
  parameters: Record<string, any>;
  actions: ConnectorAction[];
}
