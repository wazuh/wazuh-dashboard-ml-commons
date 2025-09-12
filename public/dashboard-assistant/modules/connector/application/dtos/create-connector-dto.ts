/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CreateConnectorDto {
  name: string;
  description: string;
  endpoint: string;
  model_id: string;
  headers: Record<string, string>;
  request_body: string;
  url_path: string;
  api_key: string;
  extra_parameters?: Record<string, any>;
}
