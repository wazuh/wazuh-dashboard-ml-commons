/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CreateModelDto } from '../dtos/create-model-dto';
import { ModelRepository } from '../ports/model-repository';

export const createModelUseCase = (modelRepository: ModelRepository) => async (
  createModelDto: CreateModelDto
) => {
  return await modelRepository.create(createModelDto);
};
