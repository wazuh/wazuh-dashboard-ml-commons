/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { AgentOpenSearchRequestFactory } from './agent-opensearch-request-factory';
import { AgentType } from '../../../domain/enums/agent-type';
import { Tool } from '../../../domain/enums/tool';

describe('AgentOpenSearchRequestFactory', () => {
  it('creates full agent request using provided config and nested LLM dto', () => {
    const dto = AgentOpenSearchRequestFactory.create({
      name: 'my-agent',
      type: AgentType.CONVERSATIONAL,
      description: 'desc',
      model_id: 'model-1',
      response_filter: '$.x',
      tools: [
        {
          type: Tool.ML_MODEL_TOOL,
          name: 't',
          description: 'd',
          parameters: {},
        },
      ],
    });
    expect(dto).toMatchObject({
      name: 'my-agent',
      type: AgentType.CONVERSATIONAL,
      description: 'desc',
      memory: { type: 'conversation_index' },
      llm: expect.objectContaining({ model_id: 'model-1' }),
      tools: expect.arrayContaining([expect.objectContaining({ type: Tool.ML_MODEL_TOOL })]),
      app_type: expect.any(String),
    });
  });
});
