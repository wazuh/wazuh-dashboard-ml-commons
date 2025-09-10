/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ModelStatus } from '../enums/model-status';

export interface Model {
  id: string;
  name: string;
  function_name: string;
  model_group_id?: string;
  connector_id: string;
  description: string;
  version: string;
  status: ModelStatus;
  created_at: string;
}
