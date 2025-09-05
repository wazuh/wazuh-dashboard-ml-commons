import type { HttpClient } from '../domain/entities/http-client';
import { ProxyHttpClient } from './proxy-http-client';

class HttpClientSpy implements HttpClient {
  calls: Array<{
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    url: string;
    body?: unknown;
  }> = [];
  async get<T>(_url: string): Promise<T> {
    throw new Error('not used');
  }
  async post<T>(url: string, data?: unknown): Promise<T> {
    this.calls.push({ method: 'POST', url, body: data });
    return {} as T;
  }
  async put<T>(url: string, data?: unknown): Promise<T> {
    this.calls.push({ method: 'PUT', url, body: data });
    return {} as T;
  }
  async delete<T>(url: string): Promise<T> {
    this.calls.push({ method: 'DELETE', url });
    return {} as T;
  }
}

describe('ProxyHttpClient', () => {
  it('wraps GET through proxy POST with encoded method/path', async () => {
    const spy = new HttpClientSpy();
    const client = new ProxyHttpClient(spy);
    await client.get('/_plugins/_ml/foo');
    expect(spy.calls).toEqual([
      {
        method: 'POST',
        url: '/api/console/proxy?method=GET&path=/_plugins/_ml/foo',
        body: undefined,
      },
    ]);
  });

  it('wraps POST/PUT and forwards body', async () => {
    const spy = new HttpClientSpy();
    const client = new ProxyHttpClient(spy);
    await client.post('/endpoint', { a: 1 });
    await client.put('/endpoint', { b: 2 });
    expect(spy.calls).toEqual([
      {
        method: 'POST',
        url: '/api/console/proxy?method=POST&path=/endpoint',
        body: { a: 1 },
      },
      {
        method: 'POST',
        url: '/api/console/proxy?method=PUT&path=/endpoint',
        body: { b: 2 },
      },
    ]);
  });

  it('wraps DELETE through proxy POST', async () => {
    const spy = new HttpClientSpy();
    const client = new ProxyHttpClient(spy);
    await client.delete('/resource');
    expect(spy.calls[0]).toEqual({
      method: 'POST',
      url: '/api/console/proxy?method=DELETE&path=/resource',
      body: undefined,
    });
  });
});
