/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

// Mock UI dependency imported by the repository to avoid pulling React/EUI
jest.mock(
  '../../../../../components/model-test-result',
  () => ({
    TEST_PROMPT: 'Hello!',
  }),
  { virtual: true }
);

import { ModelOpenSearchRepository } from './model-opensearch-repository';
import type { HttpClient } from '../../../../common/http/domain/entities/http-client';
import { createHttpClientMock } from '../../../../common/http/domain/entities/__mocks__/http-client';
import { ModelPredictValidator } from '../../../model-predict-validator';

describe('ModelOpenSearchRepository', () => {
  const make = () => {
    const http: jest.Mocked<HttpClient> = createHttpClientMock();
    const proxy: jest.Mocked<HttpClient> = createHttpClientMock();
    return { http, proxy, repo: new ModelOpenSearchRepository(http, proxy) };
  };

  it('create registers model and maps result', async () => {
    const { proxy, repo } = make();
    proxy.post.mockResolvedValueOnce({ model_id: 'm-1' });
    const model = await repo.create({
      name: 'n',
      connector_id: 'c',
      description: 'd',
      model_group_id: 'g',
    });
    expect(proxy.post).toHaveBeenCalledWith(
      '/_plugins/_ml/models/_register',
      expect.objectContaining({ name: 'n', connector_id: 'c' })
    );
    expect(model).toMatchObject({ id: 'm-1', name: 'n', connector_id: 'c' });
  });

  it('findById returns mapped model or null', async () => {
    const { proxy, repo } = make();
    // Found case
    proxy.post.mockResolvedValueOnce({
      hits: {
        hits: [
          {
            _id: 'm1',
            _source: {
              name: 'N',
              algorithm: 'REMOTE',
              model_group_id: 'g',
              connector_id: 'c',
              description: 'D',
              model_version: '1',
              model_state: 'DEPLOYED',
              created_time: 0,
              last_deployed_time: 0,
              deploy_to_all_nodes: false,
              is_hidden: false,
              planning_worker_node_count: 0,
              auto_redeploy_retry_times: 0,
              last_updated_time: 0,
              current_worker_node_count: 0,
              planning_worker_nodes: [],
            },
          },
        ],
      },
    });
    await expect(repo.findById('m1')).resolves.toMatchObject({ id: 'm1' });

    // Not found case
    proxy.post.mockResolvedValueOnce({ hits: { hits: [] } });
    await expect(repo.findById('m2')).resolves.toBeNull();

    // Error case returns null
    proxy.post.mockRejectedValueOnce(new Error('boom'));
    await expect(repo.findById('m3')).resolves.toBeNull();
  });

  it('getAll returns mapped list or [] on error', async () => {
    const { proxy, repo } = make();
    proxy.post.mockResolvedValueOnce({
      hits: {
        hits: [
          {
            _id: 'm1',
            _source: {
              name: 'A',
              algorithm: 'REMOTE',
              model_group_id: 'g',
              connector_id: 'c',
              description: 'd',
              model_version: '1',
              model_state: 'DEPLOYED',
              created_time: 0,
              last_deployed_time: 0,
              deploy_to_all_nodes: false,
              is_hidden: false,
              planning_worker_node_count: 0,
              auto_redeploy_retry_times: 0,
              last_updated_time: 0,
              current_worker_node_count: 0,
              planning_worker_nodes: [],
            },
          },
        ],
      },
    });
    await expect(repo.getAll()).resolves.toHaveLength(1);

    proxy.post.mockRejectedValueOnce(new Error('boom'));
    await expect(repo.getAll()).resolves.toEqual([]);
  });

  it('delete undeploys then deletes model', async () => {
    const { proxy, repo } = make();
    proxy.post.mockResolvedValueOnce({});
    proxy.delete.mockResolvedValueOnce({});
    await repo.delete('mid');
    expect(proxy.post).toHaveBeenCalledWith('/_plugins/_ml/models/mid/_undeploy', {});
    expect(proxy.delete).toHaveBeenCalledWith('/_plugins/_ml/models/mid');
  });

  it('validateConnection validates and returns response; propagates errors', async () => {
    const { proxy, repo } = make();
    const response: any = {
      inference_results: [
        {
          status_code: 200,
          output: [{ dataAsMap: { content: [{ type: 'text', text: 'ok' }] } }],
        },
      ],
    };
    const spy = jest.spyOn(ModelPredictValidator, 'validate');
    proxy.post.mockResolvedValueOnce(response);
    await expect(repo.validateConnection('m1')).resolves.toBe(response);
    expect(spy).toHaveBeenCalledWith(response);

    proxy.post.mockRejectedValueOnce(new Error('bad'));
    await expect(repo.validateConnection('m1')).rejects.toThrow('bad');
  });

  it('deploy toggles deployed state via PUT', async () => {
    const { proxy, repo } = make();
    await repo.deploy('m1', true);
    expect(proxy.put).toHaveBeenCalledWith('/_plugins/_ml/models/m1', {
      deploy: true,
    });
  });
});
