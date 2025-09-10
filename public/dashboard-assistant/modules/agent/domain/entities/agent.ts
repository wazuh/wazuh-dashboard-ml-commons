/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { AgentType } from '../enums/agent-type';
import { AgentTool } from './agent-tool';

export interface Agent {
  id: string;
  type: AgentType;
  name: string;
  description: string;
  model_id: string;
  tools: AgentTool[];
}
