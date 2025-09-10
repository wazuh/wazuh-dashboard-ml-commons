/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

// https://docs.opensearch.org/latest/ml-commons-plugin/agents-tools/agents/index/
export enum AgentType {
  FLOW = 'flow',
  CONVERSATIONAL = 'conversational',
  CONVERSATIONAL_FLOW = 'conversational_flow',
  PLAN_EXECUTE_REFLECT = 'plan_execute_reflect',
}
