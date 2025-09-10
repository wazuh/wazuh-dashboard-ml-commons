/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { MLCommonsSettingsRepository } from '../ports/ml-commons-settings-repository';
import { CreateMLCommonsDto } from '../dtos/create-ml-commons-dto';

export const persistMLCommonsSettingsUseCase = (
  MlCommonsSettingsRepository: MLCommonsSettingsRepository
) => async (createMlCommonsDto: CreateMLCommonsDto): Promise<void> => {
  await MlCommonsSettingsRepository.persist(createMlCommonsDto);
};
