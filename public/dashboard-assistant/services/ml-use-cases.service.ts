import { createAgentUseCase } from '../modules/agent/application/use-cases/create-agent';
import { registerAgentUseCase } from '../modules/agent/application/use-cases/register-agent';
import { createConnectorUseCase } from '../modules/connector/application/use-cases/create-connector';
import { installDashboardAssistantUseCase } from '../modules/installation-manager/application/use-cases';
import type { InstallationProgress } from '../modules/installation-manager/domain';
import { InstallationManager } from '../modules/installation-manager/infrastructure/installation-manager';
import { persistMLCommonsSettingsUseCase } from '../modules/ml-commons-settings/application/use-cases/update-ml-commons-settings';
import { createModelUseCase } from '../modules/model/application/use-cases/create-model';
import { deleteModelWithRelatedEntitiesUseCase } from '../modules/model/application/use-cases/delete-model-with-related-entities';
import { getModelsUseCase } from '../modules/model/application/use-cases/get-models';
import { composeModelsWithAgentDataUseCase } from '../modules/model/application/use-cases/compose-models-with-agent-info';
import { testModelConnectionUseCase } from '../modules/model/application/use-cases/test-model-connection';
import { getHttpClient, getProxyHttpClient } from './common';
import { getRepositories } from './repositories.service';

class MLUseCases {
  constructor(private repos: ReturnType<typeof getRepositories>) {}

  persistMlCommonsSettings = persistMLCommonsSettingsUseCase(
    this.repos.mlCommonsSettingsRepository,
  );
  createConnector = createConnectorUseCase(this.repos.connectorRepository);
  createModel = createModelUseCase(this.repos.modelRepository);
  createAgent = createAgentUseCase(this.repos.agentRepository);
  registerAgent = registerAgentUseCase(this.repos.agentRepository);
  getModels = getModelsUseCase(this.repos.modelRepository);
  retrieveModelsWithAgentData = composeModelsWithAgentDataUseCase(
    this.repos.modelRepository,
    this.repos.agentRepository,
    this.repos.assistantRepository,
  );
  deleteModelWithRelatedEntities = deleteModelWithRelatedEntitiesUseCase(
    this.repos.modelRepository,
    this.repos.connectorRepository,
    this.repos.modelGroupRepository,
    this.repos.agentRepository,
  );
  testModelConnection = testModelConnectionUseCase(this.repos.modelRepository);
  installDashboardAssistant = (
    callback: (progress: InstallationProgress) => void,
  ) =>
    installDashboardAssistantUseCase(
      new InstallationManager(progressUpdate => {
        callback(progressUpdate);
      }),
    );
}

let useCasesInstance: MLUseCases;

export function getUseCases() {
  if (!useCasesInstance) {
    useCasesInstance = new MLUseCases(
      getRepositories(getHttpClient(), getProxyHttpClient()),
    );
  }
  return useCasesInstance;
}
