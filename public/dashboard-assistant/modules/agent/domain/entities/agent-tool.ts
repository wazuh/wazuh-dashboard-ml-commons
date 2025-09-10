/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AgentTool {
  type: string;
  name?: string;
  description?: string;
  parameters?: Record<string, any>;
}
