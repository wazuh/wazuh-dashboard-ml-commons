/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ModelRepository } from '../ports/model-repository';

export const deleteModelUseCase = (modelRepository: ModelRepository) => async (
  modelId: string
): Promise<void> => {
  await modelRepository.delete(modelId);
};
