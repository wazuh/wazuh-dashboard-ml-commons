/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { MlCommonsPluginSettings } from './plugin-settings';

export interface ClusterSettings {
  persistent: {
    plugins: MlCommonsPluginSettings;
  };
}
