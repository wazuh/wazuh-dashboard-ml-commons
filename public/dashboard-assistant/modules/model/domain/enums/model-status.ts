/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const ModelStatus = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  ERROR: 'Error',
} as const;

export type ModelStatus = typeof ModelStatus[keyof typeof ModelStatus];
