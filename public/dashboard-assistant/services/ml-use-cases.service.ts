/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { createAgentUseCase } from '../modules/agent/application/use-cases/create-agent';
import { registerAgentUseCase } from '../modules/agent/application/use-cases/register-agent';
import { createConnectorUseCase } from '../modules/connector/application/use-cases/create-connector';
import { deleteConnectorUseCase } from '../modules/connector/application/use-cases/delete-connector';
import { triggerAIAssistantInstaller } from '../modules/installation-manager/application/use-cases';
import type { InstallationProgress } from '../modules/installation-manager/domain';
import { InstallationManager } from '../modules/installation-manager/infrastructure/installation-manager';
import { persistMLCommonsSettingsUseCase } from '../modules/ml-commons-settings/application/use-cases/update-ml-commons-settings';
import { createModelUseCase } from '../modules/model/application/use-cases/create-model';
import { deleteModelUseCase } from '../modules/model/application/use-cases/delete-model';
import { deleteModelWithRelatedEntitiesUseCase } from '../modules/model/application/use-cases/delete-model-with-related-entities';
import { getModelsUseCase } from '../modules/model/application/use-cases/get-models';
import { composeModelsWithAgentDataUseCase } from '../modules/model/application/use-cases/compose-models-with-agent-data';
import { validateModelConnectionUseCase } from '../modules/model/application/use-cases/validate-model-connection-use-case';
import { deleteAgentUseCase } from '../modules/agent/application/use-cases/delete-agent';
import { getHttpClient, getProxyHttpClient } from './common';
import { getRepositories } from './repositories.service';

class MLUseCases {
  constructor(private repos: ReturnType<typeof getRepositories>) {}

  persistMlCommonsSettings = persistMLCommonsSettingsUseCase(
    this.repos.mlCommonsSettingsRepository
  );
  createConnector = createConnectorUseCase(this.repos.connectorRepository);
  deleteConnector = deleteConnectorUseCase(this.repos.connectorRepository);
  createModel = createModelUseCase(this.repos.modelRepository);
  deleteModel = deleteModelUseCase(this.repos.modelRepository);
  createAgent = createAgentUseCase(this.repos.agentRepository);
  deleteAgent = deleteAgentUseCase(this.repos.agentRepository);
  useAgent = registerAgentUseCase(this.repos.agentRepository);
  getModels = getModelsUseCase(this.repos.modelRepository);
  getModelsWithAgentData = composeModelsWithAgentDataUseCase(
    this.repos.modelRepository,
    this.repos.agentRepository
  );
  deleteModelWithRelatedEntities = deleteModelWithRelatedEntitiesUseCase(
    this.repos.modelRepository,
    this.repos.connectorRepository,
    this.repos.modelGroupRepository,
    this.repos.agentRepository
  );
  validateModelConnection = validateModelConnectionUseCase(this.repos.modelRepository);
  beginAssistantInstallationProcess = (callback: (progress: InstallationProgress) => void) =>
    triggerAIAssistantInstaller(
      new InstallationManager((progressUpdate) => {
        callback(progressUpdate);
      })
    );
}

let useCasesInstance: MLUseCases;

export function getUseCases() {
  if (!useCasesInstance) {
    useCasesInstance = new MLUseCases(getRepositories(getHttpClient(), getProxyHttpClient()));
  }
  return useCasesInstance;
}
