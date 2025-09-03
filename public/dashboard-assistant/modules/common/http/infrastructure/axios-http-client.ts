import { HttpClient } from '../domain/entities/http-client';
import axios from 'axios';

export class AxiosHttpClient implements HttpClient {
  private defaultHeaders = {
    'osd-xsrf': 'kibana',
  };

  private axiosInstance = axios.create({
    headers: this.defaultHeaders,
  });

  async get<T = any>(url: string): Promise<T> {
    try {
      const response = await this.axiosInstance.get<T>(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async post<T = any>(url: string, data?: any): Promise<T> {
    try {
      const response = await this.axiosInstance.post<T>(url, data, {
        headers: {
          'osd-xsrf': 'kibana',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async put<T = any>(url: string, data?: any): Promise<T> {
    try {
      const response = await this.axiosInstance.put<T>(url, data, {
        headers: {
          'osd-xsrf': 'kibana',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async delete<T = any>(url: string): Promise<T> {
    try {
      const response = await this.axiosInstance.delete<T>(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}
