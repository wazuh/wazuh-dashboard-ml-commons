/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CreateModelGroupDto } from '../dtos/create-model-group-dto';
import type { ModelGroupRepository } from '../ports/model-group-repository';

export const createModelGroupUseCase = (modelGroupRepository: ModelGroupRepository) => async (
  modelGroupDto: CreateModelGroupDto
) => {
  return await modelGroupRepository.create(modelGroupDto);
};
