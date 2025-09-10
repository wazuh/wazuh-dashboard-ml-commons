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
    const model = await getUseCases().createModel(this.buildDto(request, context));
    context.set('modelId', model.id);
  }

  getSuccessMessage(): string {
    return 'Model created successfully';
  }

  getFailureMessage(): string {
    return 'Failed to create model. Please check the configuration and try again.';
  }
}
