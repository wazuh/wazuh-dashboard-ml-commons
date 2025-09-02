import { IHttpClient } from '../domain/entities/http-client';
import { CoreStart } from 'opensearch-dashboards/public';
import { HttpMethod } from '../../domain/enum/http-method';

export class HttpWithProxyClient implements IHttpClient {
  constructor(private http: CoreStart['http']) { }

  private buildProxyUrl = (method: HttpMethod, path: string) =>
    `/api/console/proxy?method=${method}&path=${path}`;

  get proxyRequest() {
    return {
      post: (url: string, data?: any) =>
        this.post(this.buildProxyUrl(HttpMethod.POST, url), data),
      get: (url: string) => this.post(this.buildProxyUrl(HttpMethod.GET, url)),
      put: (url: string, data?: any) =>
        this.post(this.buildProxyUrl(HttpMethod.PUT, url), data),
      delete: (url: string) =>
        this.post(this.buildProxyUrl(HttpMethod.DELETE, url)),
    };
  }

  async get<T = any>(url: string): Promise<T> {
    try {
      const response = await this.http.get<{ data: T }>(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: Record<string, any>,
  ): Promise<T> {
    try {
      const response = await this.http.post<T>(url, data);
      return response.body as T;
    } catch (error) {
      throw error;
    }
  }

  async put<T = any>(url: string, data?: any): Promise<T> {
    try {
      const response = await this.http.put<T>(url, data);
      return response.body as T;
    } catch (error) {
      throw error;
    }
  }

  async delete<T = any>(url: string): Promise<T> {
    try {
      const response = await this.http.delete<T>(url);
      return response;
    } catch (error) {
      throw error;
    }
  }
}
