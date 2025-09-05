/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ModelOpenSearchMapper } from './model-opensearch-mapper';
import { ModelStatus } from '../../../domain/enums/model-status';

describe('ModelOpenSearchMapper', () => {
  it('maps from request DTO to domain model with defaults', () => {
    const result = ModelOpenSearchMapper.fromRequest('id-1', {
      name: 'model',
      function_name: 'remote',
      connector_id: 'c-1',
      description: 'desc',
      model_group_id: 'g-1',
    });
    expect(result).toMatchObject({
      id: 'id-1',
      name: 'model',
      function_name: 'remote',
      connector_id: 'c-1',
      description: 'desc',
      model_group_id: 'g-1',
      version: '1',
      status: ModelStatus.ACTIVE,
    });
    expect(new Date(result.created_at).toString()).not.toBe('Invalid Date');
  });

  it('maps from OpenSearch response DTO to domain model', () => {
    const result = ModelOpenSearchMapper.fromResponse('m-1', {
      name: 'N',
      algorithm: 'REMOTE',
      model_group_id: 'g-2',
      connector_id: 'c-2',
      description: 'D',
      model_version: '7',
      model_state: 'DEPLOYED',
      created_time: 1700000000000,
      last_deployed_time: 0,
      deploy_to_all_nodes: false,
      is_hidden: false,
      planning_worker_node_count: 0,
      auto_redeploy_retry_times: 0,
      last_updated_time: 0,
      current_worker_node_count: 0,
      planning_worker_nodes: [],
    });
    expect(result).toMatchObject({
      id: 'm-1',
      name: 'N',
      function_name: 'remote',
      model_group_id: 'g-2',
      connector_id: 'c-2',
      description: 'D',
      version: '7',
      status: ModelStatus.ACTIVE,
    });
    expect(result.created_at).toBe(new Date(1700000000000).toISOString());
  });
});
