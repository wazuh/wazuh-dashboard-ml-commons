/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export enum ModelState {
  DEPLOYED = 'DEPLOYED',
  UNDEPLOYED = 'UNDEPLOYED',
  LOAD_FAILED = 'LOAD_FAILED',
  DEPLOY_FAILED = 'DEPLOY_FAILED',
  NOT_DEPLOYED = 'NOT_DEPLOYED',
  LOADED = 'LOADED',
}
