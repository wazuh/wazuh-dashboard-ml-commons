/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CreateModelDto } from '../../../application/dtos/create-model-dto';

export interface ModelOpenSearchResponseCreateDto extends CreateModelDto {
  model_id: string;
}
