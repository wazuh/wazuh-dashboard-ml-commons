/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ModelGroup } from '../../../domain/entities/model-group';

export class ModelGroupOpenSearchMapper {
  static toModel(modelGroup: { id: string; name: string; description: string }): ModelGroup {
    return {
      id: modelGroup.id,
      name: modelGroup.name,
      description: modelGroup.description,
    };
  }
}
