/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { MLCommonsSettingsHttpClientRepository } from './ml-commons-settings-http-client-repository';
import type { HttpClient } from '../../../common/http/domain/entities/http-client';
import { createHttpClientMock } from '../../../common/http/domain/entities/__mocks__/http-client';

describe('MLCommonsSettingsHttpClientRepository', () => {
  it('persist returns true on acknowledged response', async () => {
    const http: jest.Mocked<HttpClient> = createHttpClientMock();
    const proxy: jest.Mocked<HttpClient> = createHttpClientMock();
    proxy.put.mockResolvedValueOnce({ acknowledged: true });
    const repo = new MLCommonsSettingsHttpClientRepository(http, proxy);
    await expect(repo.persist({ endpoints_regex: ['.*'] })).resolves.toBe(true);
    expect(proxy.put).toHaveBeenCalledWith(
      '/_cluster/settings',
      expect.objectContaining({ persistent: expect.any(Object) })
    );
  });

  it('persist throws on unacknowledged response', async () => {
    const http: jest.Mocked<HttpClient> = createHttpClientMock();
    const proxy: jest.Mocked<HttpClient> = createHttpClientMock();
    proxy.put.mockResolvedValueOnce({ acknowledged: false });
    const repo = new MLCommonsSettingsHttpClientRepository(http, proxy);
    await expect(repo.persist({ endpoints_regex: ['.*'] })).rejects.toThrow(
      'Failed to update cluster settings'
    );
  });

  it('retrieve proxies to cluster settings endpoint', async () => {
    const http: jest.Mocked<HttpClient> = createHttpClientMock();
    const proxy: jest.Mocked<HttpClient> = createHttpClientMock();
    const payload = { settings: {} };
    proxy.post.mockResolvedValueOnce(payload);
    const repo = new MLCommonsSettingsHttpClientRepository(http, proxy);
    await expect(repo.retrieve()).resolves.toBe(payload);
    expect(proxy.post).toHaveBeenCalledWith('/_cluster/settings?include_defaults=true');
  });

  it('retrieve rethrows errors after logging', async () => {
    const http: jest.Mocked<HttpClient> = createHttpClientMock();
    const proxy: jest.Mocked<HttpClient> = createHttpClientMock();
    proxy.post.mockRejectedValueOnce(new Error('boom'));
    const repo = new MLCommonsSettingsHttpClientRepository(http, proxy);
    await expect(repo.retrieve()).rejects.toThrow('boom');
  });
});
