/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Agent } from '../../domain/entities/agent';

export interface CreateAgentDto extends Pick<Agent, 'name' | 'description' | 'type' | 'tools'> {
  model_id: string;
  response_filter: string;
  extra_parameters?: Record<string, any>;
}
