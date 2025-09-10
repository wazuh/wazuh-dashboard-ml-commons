/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AgentLLMOpenSearchRequestDto {
  model_id: string;
  parameters?: {
    max_iteration?: string;
    stop_when_no_tool_found?: string;
    response_filter?: string;
    [key: string]: any; // Allow additional parameters
  };
}
