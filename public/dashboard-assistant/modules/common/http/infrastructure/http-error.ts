/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const SENSITIVE_KEY_PATTERN = /(key|token|secret|password|authorization)$/i;
const MAX_BODY_LENGTH = 1000;

export class HttpError extends Error {
  public response?: Response;
  public status?: number;
  public statusText?: string;
  public request?: { method: string; url: string; body?: string };

  private constructor(message: string) {
    super(message);
    this.name = 'HttpError';
  }

  public static async create(
    response: Response,
    options: RequestInit & { method: string },
    url: string
  ): Promise<HttpError> {
    const method = options.method.toUpperCase();
    const sanitizedUrl = this.sanitizeUrl(url);

    const statusText = response.statusText?.trim();
    const statusSummary = statusText ? `${response.status} ${statusText}` : `${response.status}`;

    const message = this.buildFailureMessage({
      method,
      url: sanitizedUrl,
      statusSummary,
    });

    const error = new HttpError(message);
    error.response = response;
    error.status = response.status;
    error.statusText = response.statusText;
    error.request = {
      method,
      url: sanitizedUrl,
      body: this.sanitizeRequestBody(options.body ?? undefined),
    };

    return error;
  }

  private static buildFailureMessage(params: {
    method: string;
    url: string;
    statusSummary: string;
  }): string {
    const { method, url, statusSummary } = params;

    const messageParts = [`HTTP ${method} ${url} failed with status ${statusSummary}`].filter(
      Boolean
    );

    return messageParts.join('. ');
  }

  private static sanitizeUrl(url: string): string {
    try {
      const base =
        typeof window !== 'undefined' && window.location?.origin
          ? window.location.origin
          : 'http://localhost';
      const parsed = new URL(url, base);
      parsed.searchParams.forEach((value, key) => {
        if (SENSITIVE_KEY_PATTERN.test(key)) {
          parsed.searchParams.delete(key);
        }
      });

      if (!url.startsWith('http')) {
        return `${parsed.pathname}${parsed.search}${parsed.hash}` || parsed.pathname;
      }

      return parsed.toString();
    } catch (error) {
      return url;
    }
  }

  private static sanitizeStructuredValue(value: unknown): unknown {
    if (value == null) {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.sanitizeStructuredValue(item));
    }

    if (typeof value === 'object') {
      return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>(
        (acc, [key, entryValue]) => {
          if (typeof entryValue !== 'string' || !SENSITIVE_KEY_PATTERN.test(key)) {
            acc[key] = this.sanitizeStructuredValue(entryValue);
          }
          return acc;
        },
        {}
      );
    }

    return value;
  }

  private static sanitizeRequestBody(body?: BodyInit | null): string | undefined {
    if (!body) {
      return undefined;
    }

    if (typeof body === 'string') {
      try {
        const parsed = JSON.parse(body);
        const sanitized = this.sanitizeStructuredValue(parsed);
        return JSON.stringify(sanitized);
      } catch (error) {
        return body.length > MAX_BODY_LENGTH ? `${body.slice(0, MAX_BODY_LENGTH)}...` : body;
      }
    }

    return '';
  }
}
