/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { MlCommonsPluginSettings } from '../../domain/entities/plugin-settings';
import { CreateMLCommonsDto } from '../dtos/create-ml-commons-dto';

export interface MLCommonsSettingsRepository {
  persist(dto: CreateMLCommonsDto): Promise<boolean>;
  retrieve(): Promise<any>;
}
