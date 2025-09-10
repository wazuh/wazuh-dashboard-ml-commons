/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ModelGroup } from '../../domain/entities/model-group';

export type CreateModelGroupDto = Pick<ModelGroup, 'name' | 'description'>;
