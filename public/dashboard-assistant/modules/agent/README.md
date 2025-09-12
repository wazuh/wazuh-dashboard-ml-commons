# Module `agent`

Manages OpenSearch ML Commons conversational agents and their execution.

## Purpose

- Create agents with an associated LLM and configurable tools.
- Register the active agent for the Dashboard Assistant.
- Run queries against a registered agent.

## Structure

```
agent/
  application/
    use-cases/         # create-agent, register-agent
    dtos/              # CreateAgentDto, UpdateAgentDto
    ports/             # AgentRepository (contract)
  domain/
    entities/          # Agent, AgentTool
    enums/             # AgentType, Tool, AppType
  infrastructure/
    opensearch/
      repositories/    # AgentOpenSearchRepository
      factories/       # AgentOpenSearchRequestFactory, AgentLLMOpenSearchRequestFactory
      mapper/          # AgentOpenSearchMapper
```

## Key configuration points

- LLM prompt (tool `MLModelTool`):
  - File: `installation-manager/infrastructure/steps/create-agent-step.ts`
  - Field: `tools[0].parameters.prompt`
  - Change this string to modify the main LLM’s “personality” and response format.

- `SearchIndexTool` instructions:
  - File: `installation-manager/infrastructure/steps/create-agent-step.ts`
  - Field: `tools[1].description`
  - Adjust examples, default index (`wazuh-alerts-*`), and output rules (for example, “respond ONLY with JSON”).

- Agent LLM default parameters:
  - File: `agent/infrastructure/opensearch/factories/agent-llm-opensearch-request-factory.ts`
  - Properties: `max_iteration`, `stop_when_no_tool_found` (and `extra_parameters` if provided)
  - You can add or adjust limits, flags, or framework-specific parameters.

- Response filter (`response_filter`):
  - Defined per provider in `provider-model-config.ts` and used by `create-agent-step.ts`.
  - Make sure the JSONPath matches the actual provider API format (OpenAI vs Anthropic, etc.).

- Agent memory:
  - File: `agent/infrastructure/opensearch/factories/agent-opensearch-request-factory.ts`
  - Field: `memory.type = 'conversation_index'`
  - Change this value if you want a different memory type supported by ML Commons.

## Repository and use cases

- `createAgentUseCase` → Creates the agent in ML Commons.
- `registerAgentUseCase` → Registers the agent as active (`/.plugins-ml-config/_doc/os_chat`).
- `AgentOpenSearchRepository` → Real implementation against ML Commons endpoints (`/_plugins/_ml/agents`).

## Running an agent

- Method: `AgentOpenSearchRepository.execute(agentId, { parameters })`
- Typical parameters: `{ question: string, verbose?: boolean }`

> Tip: If you add new tools, be sure to document the exact format they expect in their `description` to guide the LLM.
