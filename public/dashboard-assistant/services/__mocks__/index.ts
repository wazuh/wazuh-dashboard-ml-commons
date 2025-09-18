/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MockUseCases {
  persistMlCommonsSettings?: jest.Mock<Promise<void>, [params: { endpoints_regex: string[] }]>;
  createConnector?: jest.Mock<Promise<{ id: string }>, [params: Record<string, unknown>]>;
  deleteConnector?: jest.Mock<Promise<void>, [connectorId: string]>;
  createModel?: jest.Mock<Promise<{ id: string }>, [params: Record<string, unknown>]>;
  deleteModel?: jest.Mock<Promise<void>, [modelId: string]>;
  validateModelConnection?: jest.Mock<Promise<boolean>, [modelId: string]>;
  createAgent?: jest.Mock<Promise<{ id: string }>, [params: Record<string, unknown>]>;
  deleteAgent?: jest.Mock<Promise<void>, [agentId: string]>;
  useAgent?: jest.Mock<Promise<void>, [agentId: string]>;
}

declare global {
  // eslint-disable-next-line no-var
  var __mockUseCases: MockUseCases | undefined;
}
