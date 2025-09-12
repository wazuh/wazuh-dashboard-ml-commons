/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpClient } from '../../../../common/http/domain/entities/http-client';
import { CreateAgentDto } from '../../../application/dtos/create-agent-dto';
import { AgentOpenSearchRequestFactory } from '../factories/agent-opensearch-request-factory';
import { AgentRepository } from '../../../application/ports/agent-repository';
import { Agent } from '../../../domain/entities/agent';
import { AgentOpenSearchMapper } from '../mapper/agent-opensearch-mapper';
import { AgentOpenSearchResponseDto } from '../dtos/agent-opensearch-response-dto';
import { AgentOpenSearchResponseCreateDto } from '../dtos/agent-opensearch-response-create-dto';
import { OpenSearchResponseDto } from '../../../../common/infrastructure/opensearch/dtos/opensearch-response-dto';
import { PermissionMLConfigError, PermissionMLAgentError } from '../../../domain/errors';

export class AgentOpenSearchRepository implements AgentRepository {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly proxyHttpClient: HttpClient
  ) {}

  public async create(agentDto: CreateAgentDto) {
    const agentOpenSearchRequest = AgentOpenSearchRequestFactory.create(agentDto);
    const response = await this.proxyHttpClient.post<AgentOpenSearchResponseCreateDto>(
      '/_plugins/_ml/agents/_register',
      agentOpenSearchRequest
    );
    return AgentOpenSearchMapper.fromResponse(response.agent_id, agentOpenSearchRequest);
  }

  private findManyByModelId = async (
    modelId: string,
    opts: { size?: number } = {}
  ): Promise<Agent[]> => {
    const size = opts.size || 1000;

    const searchPayload = {
      query: {
        term: {
          'llm.model_id': {
            value: modelId,
          },
        },
      },
      size,
    };

    try {
      const {
        hits: { hits },
      } = await this.proxyHttpClient.post<OpenSearchResponseDto<AgentOpenSearchResponseDto>>(
        '/_plugins/_ml/agents/_search',
        searchPayload
      );

      if (hits.length > 0) {
        return hits.map((hit) => AgentOpenSearchMapper.fromResponse(hit._id, hit._source));
      }
      return [];
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 403) {
        throw new PermissionMLAgentError();
      }
      throw err;
    }
  };

  public async findAllByModelId(modelId: string): Promise<Agent[]> {
    return await this.findManyByModelId(modelId);
  }

  public async findByModelId(modelId: string): Promise<Agent | null> {
    return (await this.findManyByModelId(modelId, { size: 1 }))[0] || null;
  }

  public async delete(id: string): Promise<void> {
    await this.proxyHttpClient.delete(`/_plugins/_ml/agents/${id}`);
  }

  public async deleteByModelId(modelId: string): Promise<void> {
    const agents = await this.findManyByModelId(modelId);
    for (const agent of agents) {
      await this.delete(agent.id);
    }
  }

  public async execute(id: string, parameters: any): Promise<any> {
    return await this.proxyHttpClient.post(`/_plugins/_ml/agents/${id}/_execute`, parameters);
  }

  public async getActive(): Promise<any> {
    try {
      const response = await this.proxyHttpClient.get('/.plugins-ml-config/_doc/os_chat');
      return response._source?.configuration?.agent_id;
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 403) {
        throw new PermissionMLConfigError();
      }
      // If this endpoint returns a 404, it does not mean that the endpoint or
      // the route was not found, but rather that there is no agent registered
      // yet. It may be because it was never registered and this is the first
      // time, or because it was deleted. It existed and was deleted.
      return undefined;
    }
  }

  public async register(agentId: string): Promise<void> {
    // Prepare the data to be sent
    const data = {
      type: 'os_chat_root_agent',
      configuration: {
        agent_id: agentId,
      },
    };

    try {
      await this.proxyHttpClient.put('/.plugins-ml-config/_doc/os_chat', data);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 403) {
        throw new PermissionMLConfigError();
      }
      throw err;
    }
  }

  public async getAll(): Promise<Agent[]> {
    const searchPayload = {
      query: { match_all: {} },
      size: 25,
    };

    const response = await this.proxyHttpClient.post<
      OpenSearchResponseDto<AgentOpenSearchResponseDto>
    >('/_plugins/_ml/agents/_search', searchPayload);

    return response.hits.hits.map((hit) =>
      AgentOpenSearchMapper.fromResponse(hit._id, hit._source)
    );
  }
}
