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

export class RegisterAgentStep extends InstallationAIAssistantStep {
  constructor() {
    super({ name: 'Register Agent' });
  }

  public async execute(
    request: InstallAIDashboardAssistantDto,
    context: InstallationContext
  ): Promise<void> {
    const details: Record<string, unknown> = {};

    if (context.has('agentId')) {
      details.agentId = context.get('agentId');
    }

    try {
      const agentId = context.get<string>('agentId');
      details.agentId = agentId;
      await getUseCases().useAgent(agentId);
    } catch (error) {
      throw StepError.create({
        stepName: this.getName(),
        action: 'registering the assistant agent for usage',
        cause: error,
        details,
      });
    }
  }

  public getSuccessMessage(): string {
    return 'Agent registered successfully';
  }

  public getFailureMessage(): string {
    return 'Failed to register agent. Please check the configuration and try again.';
  }

  public async rollback(
    _request: InstallAIDashboardAssistantDto,
    _context: InstallationContext,
    _error: Error
  ): Promise<void> {
    // Registration step does not persist reversible data beyond targeting the active agent.
  }
}
