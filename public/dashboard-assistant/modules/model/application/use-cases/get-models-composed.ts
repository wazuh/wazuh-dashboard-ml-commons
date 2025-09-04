import { ModelWithAgent } from '../../domain/entities/model-with-agent';
import { ModelWithAgentMapper } from '../mapper/model-with-agent-mapper';
import { ModelsComposed } from '../dtos/models-composed';
import { ModelRepository } from '../ports/model-repository';
import { AgentRepository } from '../../../agent/application/ports/agent-repository';
import { AssistantRepository } from '../../../assistant/application/ports/assistant-repository';
import type { Agent } from '../../../agent/domain/entities/agent';

export const getModelsComposedUseCase = (
  modelRepository: ModelRepository,
  agentRepository: AgentRepository,
  assistantRepository: AssistantRepository,
) => {
  const attachAgent = async (
    model: ModelWithAgent,
  ): Promise<ModelWithAgent> => {
    let agent: Agent | null = null;
    try {
      agent = await agentRepository.findByModelId(model.id);
    } catch {}
    return {
      ...model,
      agentId: agent?.id,
      agentName: agent?.name,
    };
  };

  return async (): Promise<ModelsComposed[]> => {
    const models = await modelRepository.getAll();

    const modelsWithAgents = await Promise.all(
      models.map(model => attachAgent(model as ModelWithAgent)),
    );

    const config = await assistantRepository.getConfig();
    const activeAgentId = config._source?.configuration?.agent_id;

    return ModelWithAgentMapper.toTableData(modelsWithAgents, activeAgentId);
  };
};
