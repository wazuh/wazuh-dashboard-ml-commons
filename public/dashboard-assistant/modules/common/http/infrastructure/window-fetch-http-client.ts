import type { HttpClient } from '../domain/entities/http-client';

export class WindowFetchHttpClient implements HttpClient {
  private defaultHeaders = { 'osd-xsrf': 'kibana' };

  private fetch(url: string, options: RequestInit) {
    return window.fetch(url, options).then(async response => {
      if (!response.ok) {
        const error = new Error(`HTTP error! status: ${response.status}`);
        (error as any).response = response;
        throw error;
      }
      return response.json();
    });
  }

  constructor() {}

  async get<T = any>(url: string): Promise<T> {
    return await this.fetch(url, {
      method: 'GET',
      headers: {
        ...this.defaultHeaders,
      },
    });
  }

  async post<T = any>(url: string, data?: any): Promise<T> {
    return await this.fetch(url, {
      method: 'POST',
      headers: {
        ...this.defaultHeaders,
        'Content-Type': 'application/json',
      },
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(url: string, data?: any): Promise<T> {
    return await this.fetch(url, {
      method: 'PUT',
      headers: {
        ...this.defaultHeaders,
        'Content-Type': 'application/json',
      },
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(url: string): Promise<T> {
    return await this.fetch(url, {
      method: 'DELETE',
      headers: {
        ...this.defaultHeaders,
      },
    });
  }
}
