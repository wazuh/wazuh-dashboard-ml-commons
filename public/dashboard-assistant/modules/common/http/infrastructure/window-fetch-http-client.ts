/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { HttpClient } from '../domain/entities/http-client';
import { HttpError } from './http-error';

export class WindowFetchHttpClient implements HttpClient {
  private defaultHeaders = { 'osd-xsrf': 'kibana' };

  private fetch(url: string, options: RequestInit) {
    if (!options.method) {
      return Promise.reject(new Error('HTTP method is required'));
    }

    options.headers = {
      ...options.headers,
      ...this.defaultHeaders,
    };

    if (['POST', 'PUT'].includes(options.method)) {
      options.headers = {
        'Content-Type': 'application/json',
        // Merge any additional headers provided in options
        ...options.headers,
      };
    }

    return window.fetch(url, options).then(async (response) => {
      if (!response.ok) {
        const error = await HttpError.create(
          response,
          options as RequestInit & { method: string },
          url
        );
        throw error;
      }
      return response.json();
    });
  }

  constructor() {}

  async get<T = any>(url: string): Promise<T> {
    return await this.fetch(url, { method: 'GET' });
  }

  async post<T = any>(url: string, data?: any): Promise<T> {
    return await this.fetch(url, {
      method: 'POST',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(url: string, data?: any): Promise<T> {
    return await this.fetch(url, {
      method: 'PUT',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(url: string): Promise<T> {
    return await this.fetch(url, { method: 'DELETE' });
  }
}
