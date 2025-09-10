/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { PermissionMLError } from '../../../common/domain/errors/permission-ml-error';

export class PermissionMLAgentError extends PermissionMLError {
  constructor() {
    super('ML Agent resources', '/.plugins-ml-agent');
    this.name = 'PermissionMLAgentError';
  }
}
