/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ModelWithAgentData {
  name: string;
  id: string;
  version: string;
  status: string;
  createdAt: string;
  agentId?: string;
  agentName?: string;
  inUse: boolean;
}
