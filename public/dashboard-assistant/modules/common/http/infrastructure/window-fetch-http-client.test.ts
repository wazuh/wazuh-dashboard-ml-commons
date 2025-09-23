/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { WindowFetchHttpClient } from './window-fetch-http-client';

interface JsonResponse {
  ok: boolean;
  status: number;
  statusText?: string;
  json: () => Promise<Record<string, unknown>>;
  clone: () => { text: () => Promise<string> };
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
      clone: () => ({
        text: async () => JSON.stringify(payload),
      }),
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
      clone: () => ({
        text: async () => JSON.stringify({}),
      }),
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

  it('propagates HTTP errors with contextual information attached', async () => {
    expect.assertions(6);
    const errorPayload = { message: 'boom' };
    const mockResponse: JsonResponse = {
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => errorPayload,
      clone: () => ({
        text: async () => JSON.stringify(errorPayload),
      }),
    };
    const fetchSpy = jest.fn().mockResolvedValue(mockResponse);
    // @ts-ignore
    window.fetch = fetchSpy;
    const client = new WindowFetchHttpClient();

    try {
      await client.delete('/x');
      throw new Error('Expected HTTP error to be thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toContain(
        'HTTP DELETE /x failed with status 500 Internal Server Error'
      );
      expect((error as { response?: JsonResponse }).response).toBe(mockResponse);
      expect((error as { request?: { method: string } }).request?.method).toBe('DELETE');
      expect((error as { status?: number }).status).toBe(500);
      expect((error as { statusText?: string }).statusText).toBe('Internal Server Error');
    }
  });
});
