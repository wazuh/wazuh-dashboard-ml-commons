/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export enum ExecutionState {
  PENDING = 'pending',
  RUNNING = 'running',
  FINISHED_SUCCESSFULLY = 'finished_successfully',
  FINISHED_WITH_WARNINGS = 'finished_with_warnings',
  FAILED = 'failed',
}
