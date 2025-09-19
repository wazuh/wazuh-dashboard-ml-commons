/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  IInstallationManager,
  InstallAIDashboardAssistantDto,
  IInstallDashboardAssistantResponse,
} from '../../domain';

export const triggerAIAssistantInstaller = (
  installationOrchestrator: IInstallationManager
) => async (
  request: InstallAIDashboardAssistantDto
): Promise<IInstallDashboardAssistantResponse> => {
  try {
    const result = await installationOrchestrator.execute(request);

    if (result.success) {
      return {
        success: true,
        message: result.message,
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message,
      data: result.data,
      rollbacks: result.rollbacks?.map((rollback) => rollback.step),
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};
