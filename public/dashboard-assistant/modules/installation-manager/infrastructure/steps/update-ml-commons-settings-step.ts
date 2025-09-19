/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { modelProviderConfigs } from '../../../../provider-model-config';
import { CreateMLCommonsDto } from '../../../ml-commons-settings/application/dtos/create-ml-commons-dto';
import {
  InstallationAIAssistantStep,
  InstallationContext,
  InstallAIDashboardAssistantDto,
} from '../../domain';
import { getUseCases } from '../../../../services/ml-use-cases.service';
import { StepError } from '../utils/step-error';

export class UpdateMlCommonsSettingsStep extends InstallationAIAssistantStep {
  constructor() {
    super({ name: 'Update ML Commons Settings' });
  }

  private buildDto(request: InstallAIDashboardAssistantDto): CreateMLCommonsDto {
    const provider = modelProviderConfigs[request.selected_provider];
    if (!provider) {
      throw new Error(
        `Unknown provider: ${request.selected_provider}. Please review configuration.`
      );
    }
    const endpointsRegex = [provider.default_endpoint_regex || '.*'];
    return { endpoints_regex: endpointsRegex };
  }

  async execute(
    request: InstallAIDashboardAssistantDto,
    context: InstallationContext
  ): Promise<void> {
    const details: Record<string, unknown> = {
      provider: request.selected_provider,
    };

    try {
      const dto = this.buildDto(request);
      details.endpointsRegex = dto.endpoints_regex;
      await getUseCases().persistMlCommonsSettings(dto);
    } catch (error) {
      throw StepError.create({
        stepName: this.getName(),
        action: 'updating ML Commons settings in the cluster',
        cause: error,
        details,
      });
    }
  }

  getSuccessMessage(): string {
    return 'ML Commons settings have been updated successfully';
  }

  getFailureMessage(): string {
    return 'Failed to update ML Commons settings. Please check the configuration and try again.';
  }

  public async rollback(
    _request: InstallAIDashboardAssistantDto,
    _context: InstallationContext,
    _error: Error
  ): Promise<void> {
    // Current implementation does not persist auxiliary data to revert; nothing to rollback.
  }
}
