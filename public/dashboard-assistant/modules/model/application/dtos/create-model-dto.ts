/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CreateModelDto {
  name: string;
  model_group_id?: string;
  description: string;
  connector_id: string;
}
