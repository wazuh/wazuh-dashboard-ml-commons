/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { WindowFetchHttpClient } from './window-fetch-http-client';

interface JsonResponse {
  ok: boolean;
  status: number;
  json: () => Promise<Record<string, unknown>>;
}

describe('WindowFetchHttpClient', () => {
  const originalFetch = window.fetch;

  afterEach(() => {
    window.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('throws if method is missing (internal guard)', async () => {
    const client = new WindowFetchHttpClient();
    // Access private method via indexer to avoid using `any` types
    const guardedFetch = ((client as unknown) as {
      fetch: (url: string, options: RequestInit) => Promise<unknown>;
    }).fetch;
    await expect(guardedFetch('/x', ({} as unknown) as RequestInit)).rejects.toThrow(
      'HTTP method is required'
    );
  });

  it('sends GET and parses JSON; merges default headers', async () => {
    const payload = { hello: 'world' };
    const mockResponse: JsonResponse = {
      ok: true,
      status: 200,
      json: async () => payload,
    };
    const fetchSpy = jest.fn().mockResolvedValue(mockResponse);
    // @ts-ignore
    window.fetch = fetchSpy;

    const client = new WindowFetchHttpClient();
    const result = await client.get('/foo');
    expect(result).toEqual(payload);
    expect(fetchSpy).toHaveBeenCalledWith(
      '/foo',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ 'osd-xsrf': 'kibana' }),
      })
    );
  });

  it('sets content-type for POST/PUT and stringifies body', async () => {
    const mockResponse: JsonResponse = {
      ok: true,
      status: 200,
      json: async () => ({}),
    };
    const fetchSpy = jest.fn().mockResolvedValue(mockResponse);
    // @ts-ignore
    window.fetch = fetchSpy;
    const client = new WindowFetchHttpClient();

    await client.post('/bar', { a: 1 });
    await client.put('/bar', { b: 2 });

    expect(fetchSpy).toHaveBeenNthCalledWith(
      1,
      '/bar',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'osd-xsrf': 'kibana',
        }),
        body: JSON.stringify({ a: 1 }),
      })
    );
    expect(fetchSpy).toHaveBeenNthCalledWith(
      2,
      '/bar',
      expect.objectContaining({
        method: 'PUT',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'osd-xsrf': 'kibana',
        }),
        body: JSON.stringify({ b: 2 }),
      })
    );
  });

  it('propagates HTTP errors with response attached', async () => {
    const mockResponse: JsonResponse = {
      ok: false,
      status: 500,
      json: async () => ({ message: 'boom' }),
    };
    const fetchSpy = jest.fn().mockResolvedValue(mockResponse);
    // @ts-ignore
    window.fetch = fetchSpy;
    const client = new WindowFetchHttpClient();
    await expect(client.delete('/x')).rejects.toMatchObject({
      message: 'HTTP error! status: 500',
      response: mockResponse,
    });
  });
});
