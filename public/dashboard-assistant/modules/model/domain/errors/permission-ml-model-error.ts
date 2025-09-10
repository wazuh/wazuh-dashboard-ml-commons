/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { PermissionMLError } from '../../../common/domain/errors';

export class PermissionMLModelError extends PermissionMLError {
  constructor() {
    super('ML Model resources', '.plugins-ml-model');
    this.name = 'PermissionMLModelError';
  }
}
