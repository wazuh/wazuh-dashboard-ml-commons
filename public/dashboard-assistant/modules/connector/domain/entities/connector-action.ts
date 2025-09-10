/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ConnectorAction {
  action_type: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  request_body: string;
}
