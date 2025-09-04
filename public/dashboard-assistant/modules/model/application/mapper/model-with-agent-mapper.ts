import { ModelWithAgent } from '../../domain/entities/model-with-agent';
import { ModelStatus } from "../../domain/enums/model-status";
import { ModelsComposed } from '../dtos/models-composed';

export class ModelWithAgentMapper {
  public static toTableData(
    models: ModelWithAgent[],
    activeAgentId?: string,
  ): ModelsComposed[] {
    return models.map(model => ({
      name: model.name,
      id: model.id,
      version: model.version,
      status: !model.agentId ? ModelStatus.INACTIVE : model.status,
      createdAt: model.created_at,
      agentId: model.agentId,
      agentName: model.agentName,
      inUse: model.agentId === activeAgentId,
    }));
  }
}
