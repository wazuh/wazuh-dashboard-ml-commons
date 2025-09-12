/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { AgentLLMOpenSearchRequestFactory } from './agent-llm-opensearch-request-factory';

describe('AgentLLMOpenSearchRequestFactory', () => {
  it('builds DTO with defaults merged with extra_parameters', () => {
    const dto = AgentLLMOpenSearchRequestFactory.create({
      model_id: 'model-123',
      response_filter: '$.data',
      extra_parameters: { max_iteration: 5, custom_flag: true },
    });
    expect(dto).toEqual({
      model_id: 'model-123',
      parameters: expect.objectContaining({
        response_filter: '$.data',
        stop_when_no_tool_found: true, // default present
        max_iteration: 5, // overridden by extra_parameters
        custom_flag: true,
      }),
    });
  });
});
