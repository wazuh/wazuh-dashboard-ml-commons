/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const StepStatus = {
  PENDING: 'pending',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
} as const;

export type StepStatus = typeof StepStatus[keyof typeof StepStatus];
