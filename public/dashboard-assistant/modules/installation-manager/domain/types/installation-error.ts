/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export interface InstallationError {
  step: string;
  message: string;
  details?: any;
}
