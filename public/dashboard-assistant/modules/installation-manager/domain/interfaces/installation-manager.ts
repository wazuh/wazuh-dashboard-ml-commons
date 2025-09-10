/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { InstallAIDashboardAssistantDto, InstallationResult } from '../types';

export interface IInstallationManager {
  execute(request: InstallAIDashboardAssistantDto): Promise<InstallationResult>;
}
