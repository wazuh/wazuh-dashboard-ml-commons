/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { AgentOpenSearchRepository } from './agent-opensearch-repository';
import { HttpClient } from '../../../../common/http/domain/entities/http-client';
import { AgentType } from '../../../domain/enums/agent-type';
import { Tool } from '../../../domain/enums/tool';

function createHttpClientMock(): jest.Mocked<HttpClient> {
  return {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  };
}

describe('AgentOpenSearchRepository', () => {
  const dummyHttp: jest.Mocked<HttpClient> = createHttpClientMock();
  let proxyHttp: jest.Mocked<HttpClient>;
  let repo: AgentOpenSearchRepository;

  beforeEach(() => {
    proxyHttp = createHttpClientMock();
    repo = new AgentOpenSearchRepository(dummyHttp, proxyHttp);
  });

  it('creates an agent and maps response', async () => {
    proxyHttp.post.mockResolvedValueOnce({ agent_id: 'agent-1' });
    const createDto = {
      name: 'agent',
      type: AgentType.CONVERSATIONAL,
      description: 'desc',
      model_id: 'model-1',
      response_filter: '$.x',
      tools: [
        {
          type: Tool.ML_MODEL_TOOL,
          name: 't',
          description: 'd',
          parameters: {},
        },
      ],
    };
    const agent = await repo.create(createDto);
    // POST called to register endpoint
    expect(proxyHttp.post).toHaveBeenCalledWith(
      '/_plugins/_ml/agents/_register',
      expect.objectContaining({
        name: 'agent',
        llm: expect.objectContaining({ model_id: 'model-1' }),
      })
    );
    expect(agent).toEqual({
      id: 'agent-1',
      name: 'agent',
      type: AgentType.CONVERSATIONAL,
      description: 'desc',
      model_id: 'model-1',
      tools: expect.any(Array),
    });
  });

  it('findAllByModelId returns mapped agents', async () => {
    proxyHttp.post.mockResolvedValueOnce({
      hits: {
        hits: [
          {
            _id: 'a1',
            _source: {
              name: 'A',
              type: AgentType.CONVERSATIONAL,
              description: 'd',
              llm: { model_id: 'm' },
              tools: [],
            },
          },
          {
            _id: 'a2',
            _source: {
              name: 'B',
              type: AgentType.CONVERSATIONAL,
              description: 'd',
              llm: { model_id: 'm' },
              tools: [],
            },
          },
        ],
      },
    });
    const res = await repo.findAllByModelId('m');
    expect(proxyHttp.post).toHaveBeenCalledWith(
      '/_plugins/_ml/agents/_search',
      expect.objectContaining({ query: expect.any(Object), size: 1000 })
    );
    expect(res.map((r) => r.id)).toEqual(['a1', 'a2']);
  });

  it('findByModelId returns first match or null', async () => {
    // First call returns 1 result
    proxyHttp.post
      .mockResolvedValueOnce({
        hits: {
          hits: [
            {
              _id: 'a1',
              _source: {
                name: 'A',
                type: AgentType.CONVERSATIONAL,
                description: 'd',
                llm: { model_id: 'm' },
                tools: [],
              },
            },
          ],
        },
      })
      // Second call returns no results
      .mockResolvedValueOnce({ hits: { hits: [] } });
    await expect(repo.findByModelId('m')).resolves.toMatchObject({ id: 'a1' });
    await expect(repo.findByModelId('m')).resolves.toBeNull();
  });

  it('delete deletes by id', async () => {
    proxyHttp.delete.mockResolvedValueOnce(undefined as never);
    await repo.delete('agent-9');
    expect(proxyHttp.delete).toHaveBeenCalledWith('/_plugins/_ml/agents/agent-9');
  });

  it('deleteByModelId finds and deletes all', async () => {
    // First, search returns two agents
    proxyHttp.post.mockResolvedValueOnce({
      hits: {
        hits: [
          {
            _id: 'a1',
            _source: {
              name: 'A',
              type: AgentType.CONVERSATIONAL,
              description: 'd',
              llm: { model_id: 'm' },
              tools: [],
            },
          },
          {
            _id: 'a2',
            _source: {
              name: 'B',
              type: AgentType.CONVERSATIONAL,
              description: 'd',
              llm: { model_id: 'm' },
              tools: [],
            },
          },
        ],
      },
    });
    proxyHttp.delete.mockResolvedValue(undefined as never);
    await repo.deleteByModelId('m');
    expect(proxyHttp.delete).toHaveBeenNthCalledWith(1, '/_plugins/_ml/agents/a1');
    expect(proxyHttp.delete).toHaveBeenNthCalledWith(2, '/_plugins/_ml/agents/a2');
  });

  it('execute posts to execute endpoint and returns the value', async () => {
    proxyHttp.post.mockResolvedValueOnce({ ok: true });
    const res = await repo.execute('agent-123', { q: 1 });
    expect(proxyHttp.post).toHaveBeenCalledWith('/_plugins/_ml/agents/agent-123/_execute', {
      q: 1,
    });
    expect(res).toEqual({ ok: true });
  });

  it('getActive returns configured agent id when available', async () => {
    proxyHttp.get.mockResolvedValueOnce({
      _source: { configuration: { agent_id: 'a1' } },
    });
    await expect(repo.getActive()).resolves.toBe('a1');
    expect(proxyHttp.get).toHaveBeenCalledWith('/.plugins-ml-config/_doc/os_chat');
  });

  it('getActive throws a permission error when 403', async () => {
    proxyHttp.get.mockRejectedValueOnce({ response: { status: 403 } });
    await expect(repo.getActive()).rejects.toThrow(/You don't have the necessary permissions/);
  });

  it('getActive returns undefined on non-403 errors (e.g., 404)', async () => {
    proxyHttp.get.mockRejectedValueOnce({ response: { status: 404 } });
    await expect(repo.getActive()).resolves.toBeUndefined();
  });

  it('getAll returns mapped agents and rethrows on errors', async () => {
    proxyHttp.post
      .mockResolvedValueOnce({
        hits: {
          hits: [
            {
              _id: 'a1',
              _source: {
                name: 'A',
                type: AgentType.CONVERSATIONAL,
                description: 'd',
                llm: { model_id: 'm' },
                tools: [],
              },
            },
          ],
        },
      })
      .mockRejectedValueOnce(new Error('boom'));

    await expect(repo.getAll()).resolves.toHaveLength(1);
    await expect(repo.getAll()).rejects.toThrow('boom');
  });
});
