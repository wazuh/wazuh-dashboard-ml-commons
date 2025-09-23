/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { modelProviderConfigs } from '../../../../provider-model-config';
import { CreateConnectorDto } from '../../../connector/application/dtos/create-connector-dto';
import {
  InstallationContext,
  InstallationAIAssistantStep,
  InstallAIDashboardAssistantDto,
} from '../../domain';
import { getUseCases } from '../../../../services/ml-use-cases.service';
import { StepError } from '../utils/step-error';

export class CreateConnectorStep extends InstallationAIAssistantStep {
  constructor() {
    super({ name: 'Create Connector' });
  }

  private buildDto(request: InstallAIDashboardAssistantDto): CreateConnectorDto {
    const provider = modelProviderConfigs[request.selected_provider];
    if (!provider) {
      throw new Error(
        `Unknown provider: ${request.selected_provider}. Please review configuration.`
      );
    }
    return {
      name: `${request.selected_provider} Chat Connector`,
      description: `Connector to ${request.selected_provider} model service for ${request.model_id}`,
      endpoint: request.api_url,
      model_id: request.model_id,
      api_key: request.api_key,
      url_path: provider.url_path,
      headers: provider.headers,
      request_body: provider.request_body,
      extra_parameters: provider.extra_parameters || {},
    };
  }

  async execute(
    request: InstallAIDashboardAssistantDto,
    context: InstallationContext
  ): Promise<void> {
    const details: Record<string, unknown> = {
      provider: request.selected_provider,
      endpoint: request.api_url,
      modelId: request.model_id,
    };

    try {
      const dto = this.buildDto(request);
      details.connectorName = dto.name;
      const connector = await getUseCases().createConnector(dto);
      details.connectorId = connector?.id;
      context.set('connectorId', connector.id);
    } catch (error) {
      throw StepError.create({
        stepName: this.getName(),
        action: 'creating the ML Commons connector',
        cause: error,
        details,
      });
    }
  }

  getSuccessMessage(): string {
    return 'Connector created successfully';
  }

  getFailureMessage(): string {
    return 'Failed to create connector. Please check the configuration and try again.';
  }

  public async rollback(
    _request: InstallAIDashboardAssistantDto,
    context: InstallationContext,
    _error: Error
  ): Promise<void> {
    if (!context.has('connectorId')) {
      return;
    }

    const connectorId = context.get<string>('connectorId');
    try {
      await getUseCases().deleteConnector(connectorId);
      context.delete('connectorId');
    } catch (error) {
      throw new Error(
        `Failed to rollback connector creation for connectorId="${connectorId}": ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}
