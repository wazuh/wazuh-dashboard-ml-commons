/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ExecutionState } from '../enums';

export interface StepState {
  stepName: string;
  state: ExecutionState;
  message?: string;
  error?: Error;
}
