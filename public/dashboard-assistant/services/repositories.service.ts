/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { AgentRepository } from '../modules/agent/application/ports/agent-repository';
import { AgentOpenSearchRepository } from '../modules/agent/infrastructure/opensearch/repositories/agent-opensearch-repository';
import type { HttpClient } from '../modules/common/http/domain/entities/http-client';
import type { ConnectorRepository } from '../modules/connector/application/ports/connector-repository';
import { ConnectorOpenSearchRepository } from '../modules/connector/infrastructure/opensearch/repositories/connector-opensearch-repository';
import type { MLCommonsSettingsRepository } from '../modules/ml-commons-settings/application/ports/ml-commons-settings-repository';
import { MLCommonsSettingsHttpClientRepository } from '../modules/ml-commons-settings/infrastructure/repositories/ml-commons-settings-http-client-repository';
import type { ModelGroupRepository } from '../modules/model-group/application/ports/model-group-repository';
import { ModelGroupOpenSearchRepository } from '../modules/model-group/infrastructure/opensearch/repositories/model-group-opensearch-repository';
import type { ModelRepository } from '../modules/model/application/ports/model-repository';
import { ModelOpenSearchRepository } from '../modules/model/infrastructure/opensearch/repositories/model-opensearch-repository';

/**
 * Singleton object to hold repository instances.
 */
class Repositories {
  private static mlCommonsSettingsRepository?: MLCommonsSettingsRepository;
  private static modelGroupRepository?: ModelGroupRepository;
  private static connectorRepository?: ConnectorRepository;
  private static modelRepository?: ModelRepository;
  private static agentRepository?: AgentRepository;

  private static init(httpClient: HttpClient, proxyHttpClient: HttpClient) {
    this.mlCommonsSettingsRepository ??= new MLCommonsSettingsHttpClientRepository(
      httpClient,
      proxyHttpClient
    );
    this.modelGroupRepository ??= new ModelGroupOpenSearchRepository(httpClient, proxyHttpClient);
    this.connectorRepository ??= new ConnectorOpenSearchRepository(httpClient, proxyHttpClient);
    this.modelRepository ??= new ModelOpenSearchRepository(httpClient, proxyHttpClient);
    this.agentRepository ??= new AgentOpenSearchRepository(httpClient, proxyHttpClient);
  }

  static getInstance(httpClient: HttpClient, proxyHttpClient: HttpClient) {
    this.init(httpClient, proxyHttpClient);
    return {
      mlCommonsSettingsRepository: this.mlCommonsSettingsRepository!,
      modelGroupRepository: this.modelGroupRepository!,
      connectorRepository: this.connectorRepository!,
      modelRepository: this.modelRepository!,
      agentRepository: this.agentRepository!,
    };
  }
}

let repositoriesInstance: ReturnType<typeof Repositories.getInstance> | null = null;

export function getRepositories(httpClient: HttpClient, proxyHttpClient: HttpClient) {
  if (!repositoriesInstance) {
    repositoriesInstance = Repositories.getInstance(httpClient, proxyHttpClient);
  }
  return repositoriesInstance;
}
