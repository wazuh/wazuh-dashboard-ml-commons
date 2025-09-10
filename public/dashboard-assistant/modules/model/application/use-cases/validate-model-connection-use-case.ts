/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ModelPredictResponse } from '../../domain/types';
import { ModelRepository } from '../ports/model-repository';

export const validateModelConnectionUseCase = (modelRepository: ModelRepository) => async (
  modelId: string
): Promise<ModelPredictResponse> => {
  return await modelRepository.validateConnection(modelId);
};
