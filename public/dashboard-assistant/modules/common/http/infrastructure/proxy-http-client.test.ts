/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProxyHttpClient } from './proxy-http-client';
import type { HttpClient } from '../domain/entities/http-client';
import { createHttpClientMock } from '../domain/entities/__mocks__/http-client';

describe('ProxyHttpClient', () => {
  it('wraps GET via POST to proxy URL', async () => {
    const base: jest.Mocked<HttpClient> = createHttpClientMock();
    base.post.mockResolvedValueOnce({ ok: true });
    const proxy = new ProxyHttpClient(base);
    await proxy.get('/_plugins/_ml/models');
    expect(base.post).toHaveBeenCalledWith(
      '/api/console/proxy?method=GET&path=/_plugins/_ml/models'
    );
  });

  it('forwards POST/PUT/DELETE with data where applicable', async () => {
    const base: jest.Mocked<HttpClient> = createHttpClientMock();
    const proxy = new ProxyHttpClient(base);
    await proxy.post('/x', { a: 1 });
    await proxy.put('/y', { b: 2 });
    await proxy.delete('/z');
    expect(base.post).toHaveBeenNthCalledWith(1, '/api/console/proxy?method=POST&path=/x', {
      a: 1,
    });
    expect(base.post).toHaveBeenNthCalledWith(2, '/api/console/proxy?method=PUT&path=/y', { b: 2 });
    expect(base.post).toHaveBeenNthCalledWith(3, '/api/console/proxy?method=DELETE&path=/z');
  });
});
