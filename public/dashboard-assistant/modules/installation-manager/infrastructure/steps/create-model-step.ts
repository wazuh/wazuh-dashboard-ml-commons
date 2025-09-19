/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { getUseCases } from '../../../../services/ml-use-cases.service';
import { CreateModelDto } from '../../../model/application/dtos/create-model-dto';
import {
  InstallationContext,
  InstallationAIAssistantStep,
  InstallAIDashboardAssistantDto,
} from '../../domain';
import { StepError } from '../utils/step-error';

export class CreateModelStep extends InstallationAIAssistantStep {
  constructor() {
    super({ name: 'Create Model' });
  }

  private buildDto(
    request: InstallAIDashboardAssistantDto,
    context: InstallationContext
  ): CreateModelDto {
    return {
      connector_id: context.get('connectorId'),
      name: request.selected_provider,
      description: request.description || `${request.selected_provider} language model`,
    };
  }

  async execute(
    request: InstallAIDashboardAssistantDto,
    context: InstallationContext
  ): Promise<void> {
    const details: Record<string, unknown> = {
      provider: request.selected_provider,
    };

    if (context.has('connectorId')) {
      details.connectorId = context.get('connectorId');
    }

    try {
      const dto = this.buildDto(request, context);
      const model = await getUseCases().createModel(dto);
      details.modelId = model?.id;
      context.set('modelId', model.id);
    } catch (error) {
      throw StepError.create({
        stepName: this.getName(),
        action: 'creating the ML Commons model',
        cause: error,
        details,
      });
    }
  }

  getSuccessMessage(): string {
    return 'Model created successfully';
  }

  getFailureMessage(): string {
    return 'Failed to create model. Please check the configuration and try again.';
  }

  public async rollback(
    _request: InstallAIDashboardAssistantDto,
    context: InstallationContext,
    _error: Error
  ): Promise<void> {
    if (!context.has('modelId')) {
      return;
    }

    const modelId = context.get<string>('modelId');
    try {
      await getUseCases().deleteModel(modelId);
      context.delete('modelId');
    } catch (error) {
      throw new Error(
        `Failed to rollback model creation for modelId="${modelId}": ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}
