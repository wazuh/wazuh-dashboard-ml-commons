/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpMethod } from '../../domain/enum/http-method';
import type { HttpClient } from '../domain/entities/http-client';

export class ProxyHttpClient implements HttpClient {
  constructor(private readonly httpClient: HttpClient) {}

  private buildProxyUrl = (method: HttpMethod, path: string) =>
    `/api/console/proxy?method=${method}&path=${path}`;

  get<T = any>(url: string): Promise<T> {
    return this.httpClient.post(this.buildProxyUrl(HttpMethod.GET, url));
  }
  post<T = any>(url: string, data?: any): Promise<T> {
    return this.httpClient.post(this.buildProxyUrl(HttpMethod.POST, url), data);
  }
  put<T = any>(url: string, data?: any): Promise<T> {
    return this.httpClient.post(this.buildProxyUrl(HttpMethod.PUT, url), data);
  }
  delete<T = any>(url: string): Promise<T> {
    return this.httpClient.post(this.buildProxyUrl(HttpMethod.DELETE, url));
  }
}
