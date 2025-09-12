/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ModelGroupOpenSearchRepository } from './model-group-opensearch-repository';
import { HttpClient } from '../../../../common/http/domain/entities/http-client';

function createHttpClientMock(): jest.Mocked<HttpClient> {
  return { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() };
}

describe('ModelGroupOpenSearchRepository', () => {
  it('creates and returns ModelGroup mapped from response', async () => {
    const http = createHttpClientMock();
    const proxy = createHttpClientMock();
    proxy.post.mockResolvedValueOnce({ model_group_id: 'mg-1' });
    const repo = new ModelGroupOpenSearchRepository(http, proxy);
    const res = await repo.create({ name: 'g', description: 'd' });
    expect(proxy.post).toHaveBeenCalledWith('/_plugins/_ml/model_groups/_register', {
      name: 'g',
      description: 'd',
    });
    expect(res).toEqual({ id: 'mg-1', name: 'g', description: 'd' });
  });

  it('deletes model group by id', async () => {
    const repo = new ModelGroupOpenSearchRepository(createHttpClientMock(), createHttpClientMock());
    repo.proxyHttpClient.delete = jest.fn();
    await repo.delete('mg-9');
    expect(repo.proxyHttpClient.delete).toHaveBeenCalledWith('/_plugins/_ml/model_groups/mg-9');
  });
});
