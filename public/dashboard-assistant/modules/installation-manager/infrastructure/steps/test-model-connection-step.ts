/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { getUseCases } from '../../../../services/ml-use-cases.service';
import {
  InstallationContext,
  InstallationAIAssistantStep,
  InstallAIDashboardAssistantDto,
} from '../../domain';
import { StepError } from '../utils/step-error';

const extractStatusCode = (error: unknown): number | undefined => {
  if (!error || typeof error !== 'object') {
    return undefined;
  }

  const possibleStatus = (error as { status?: unknown }).status;
  const responseStatus = (error as { response?: { status?: unknown } }).response?.status;

  const parseStatus = (value: unknown): number | undefined => {
    if (typeof value === 'number') {
      return value;
    }
    if (typeof value === 'string') {
      const parsed = Number.parseInt(value, 10);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
    return undefined;
  };

  const directStatus = parseStatus(possibleStatus);
  if (typeof directStatus === 'number') {
    return directStatus;
  }

  const nestedStatus = parseStatus(responseStatus);
  if (typeof nestedStatus === 'number') {
    return nestedStatus;
  }

  return undefined;
};

const derivePossibleCauses = (error: unknown, modelId?: string): string[] => {
  const causes = new Set<string>();
  const status = extractStatusCode(error);
  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  if (status === 401 || status === 403) {
    causes.add('Verify the API key; it may be incorrect or lack permissions.');
  }

  if (status === 404) {
    causes.add(
      modelId
        ? `Confirm that model \`${modelId}\` exists and is deployed.`
        : 'Confirm that the selected model exists and is deployed.'
    );
  }

  const indicatesNetworkIssue =
    !status &&
    (error instanceof TypeError ||
      message.includes('failed to fetch') ||
      message.includes('network'));

  if (indicatesNetworkIssue) {
    causes.add('Check the API URL for typos and ensure the endpoint is reachable.');
  }

  return Array.from(causes);
};

export class TestModelConnectionStep extends InstallationAIAssistantStep {
  constructor() {
    super({ name: 'Test Model Connection' });
  }

  public async execute(
    request: InstallAIDashboardAssistantDto,
    context: InstallationContext
  ): Promise<void> {
    const details: Record<string, unknown> = {};
    const modelId: string | undefined = context.has('modelId') ? context.get('modelId') : undefined;

    if (modelId) {
      details.modelId = modelId;
    }

    try {
      if (!modelId) {
        throw new Error('Model identifier not found in installation context');
      }
      const isConnected = await getUseCases().validateModelConnection(modelId);
      if (!isConnected) {
        throw new Error('Model connection validation returned false');
      }
    } catch (error) {
      throw StepError.create({
        stepName: this.getName(),
        action: 'validating the model connection',
        cause: error,
        details,
        possibleCauses: derivePossibleCauses(error, modelId),
      });
    }
  }

  public getSuccessMessage(): string {
    return 'Model connection tested successfully';
  }

  public getFailureMessage(): string {
    return 'Failed to test model connection. Please check the model configuration and try again.';
  }

  public async rollback(
    _request: InstallAIDashboardAssistantDto,
    _context: InstallationContext,
    _error: Error
  ): Promise<void> {
    // This step only validates connectivity and does not create resources.
  }
}
