/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { PermissionMLError } from '../../../common/domain/errors/permission-ml-error';

export class PermissionMLConfigError extends PermissionMLError {
  constructor() {
    super('ML configuration', '/.plugins-ml-config');
    this.name = 'PermissionMLConfigError';
  }
}
