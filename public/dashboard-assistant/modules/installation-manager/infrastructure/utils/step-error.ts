/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export interface StepErrorOptions {
  stepName: string;
  action?: string;
  cause: unknown;
  details?: Record<string, unknown>;
  possibleCauses?: string[];
}

const SENSITIVE_KEY_PATTERN = /(key|token|secret|password|authorization)$/i;
const MAX_DETAIL_VALUE_LENGTH = 500;

export class StepError extends Error {
  public details?: Record<string, unknown>;
  public cause?: Error;

  private constructor(message: string, cause: Error, details?: Record<string, unknown>) {
    super(message);
    this.name = 'StepError';
    this.details = details;
    this.cause = cause;

    if (cause.stack) {
      this.stack = cause.stack;
    }
  }

  public static create(options: StepErrorOptions): StepError {
    const cause = options.cause instanceof Error ? options.cause : new Error(String(options.cause));
    const sanitizedDetails = this.sanitizeDetails(options.details);
    const detailsText = this.formatDetails(sanitizedDetails);
    const possibleCausesText = this.formatPossibleCauses(options.possibleCauses);

    const message = this.buildMessage({
      stepName: options.stepName,
      action: options.action,
      detailsText,
      possibleCausesText,
      causeMessage: cause.message,
    });

    return new StepError(message, cause, sanitizedDetails);
  }

  private static buildMessage(params: {
    stepName: string;
    action?: string;
    detailsText?: string;
    possibleCausesText?: string;
    causeMessage: string;
  }): string {
    const { stepName, action, detailsText, possibleCausesText, causeMessage } = params;

    const messageParts = [
      `"${stepName}" step failed${action ? ` while ${action}` : ''}`,
      detailsText ? `Details: ${detailsText}` : undefined,
      possibleCausesText ? `Possible causes: ${possibleCausesText}` : undefined,
      `Cause: ${causeMessage}`,
    ].filter(Boolean);

    return messageParts.join('. ');
  }

  private static sanitizeDetailValue(key: string, value: unknown): unknown {
    if (value == null) {
      return value;
    }

    if (typeof value === 'string') {
      if (SENSITIVE_KEY_PATTERN.test(key)) {
        return '';
      }

      return value.length > MAX_DETAIL_VALUE_LENGTH
        ? `${value.slice(0, MAX_DETAIL_VALUE_LENGTH)}...`
        : value;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return value;
    }

    try {
      const serialized = JSON.stringify(value);
      if (!serialized) {
        return value;
      }
      return serialized.length > MAX_DETAIL_VALUE_LENGTH
        ? `${serialized.slice(0, MAX_DETAIL_VALUE_LENGTH)}...`
        : serialized;
    } catch (error) {
      return value;
    }
  }

  private static sanitizeDetails(
    details?: Record<string, unknown>
  ): Record<string, unknown> | undefined {
    if (!details) {
      return undefined;
    }

    return Object.entries(details).reduce<Record<string, unknown>>((acc, [key, value]) => {
      acc[key] = this.sanitizeDetailValue(key, value);
      return acc;
    }, {});
  }

  private static formatDetails(details?: Record<string, unknown>): string | undefined {
    if (!details || Object.keys(details).length === 0) {
      return undefined;
    }

    return Object.entries(details)
      .map(([key, value]) => `${key}=${value}`)
      .join(', ');
  }

  private static formatPossibleCauses(possibleCauses?: string[]): string | undefined {
    if (!possibleCauses || possibleCauses.length === 0) {
      return undefined;
    }

    const trimmed = possibleCauses.map((cause) => cause.trim()).filter((cause) => cause.length > 0);

    if (trimmed.length === 0) {
      return undefined;
    }

    return trimmed.join('; ');
  }
}
