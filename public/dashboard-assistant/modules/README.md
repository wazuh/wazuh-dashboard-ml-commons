# Dashboard Assistant — Modules

Quick guide to the Dashboard Assistant module structure (Clean Architecture) and the most useful configuration points, including where to change prompts and agent tools.

## Overall Structure

Each module follows a consistent hierarchy:

```
modules/
  <module>/
    application/     # Use cases (orchestration logic)
    domain/          # Entities, enums, types and contracts
    infrastructure/  # Repositories, mappers and factories toward OpenSearch
    hooks/           # (Optional) React hooks for the module
```

Included modules:

- agent
- common
- connector
- installation-manager
- ml-commons-settings
- model
- model-group

## Installer Flow (summary)

The installer creates and connects components in this order:

1) Update ML Commons settings → `installation-manager/infrastructure/steps/update-ml-commons-settings-step.ts`
2) Create connector (LLM provider) → `installation-manager/infrastructure/steps/create-connector-step.ts`
3) Register model → `installation-manager/infrastructure/steps/create-model-step.ts`
4) Test model connectivity → `installation-manager/infrastructure/steps/test-model-connection-step.ts`
5) Create agent (with tools) → `installation-manager/infrastructure/steps/create-agent-step.ts`
6) Register active agent → `installation-manager/infrastructure/steps/register-agent-step.ts`

The installation context (`InstallationContext`) stores intermediate IDs like `connectorId`, `modelId`, and `agentId`.

## Where to Change Prompts and Tools

- Main LLM prompt (tool `MLModelTool`):
  - `installation-manager/infrastructure/steps/create-agent-step.ts` → `parameters.prompt` of the tool.
- Connector base prompt (initial system/developer message):
  - `connector/domain/constants.ts` → constant `ASSISTANT_PROMPT`.
- Model connectivity test prompt:
  - `components/model-test-result.tsx` → constant `TEST_PROMPT`.
- `SearchIndexTool` instructions (what/how to query indices):
  - `installation-manager/infrastructure/steps/create-agent-step.ts` → `description` of the `SearchIndexTool`.

Tip: keep the instruction "respond ONLY with JSON" in tools that expect JSON to avoid extra text that breaks parsing.

## LLM Provider Configuration

- Central file: `public/dashboard-assistant/provider-model-config.ts`
  - Config fields: `models`, `default_model`, `default_endpoint`, `headers`, `url_path`, `request_body`.
  - `response_filter`: a JSONPath used to extract model content (applied when creating the agent).
  - `default_endpoint_regex`: used for `trusted_connector_endpoints_regex` (ML Commons).

Impact on the flow:

- `UpdateMlCommonsSettingsStep` uses `default_endpoint_regex`.
- `CreateConnectorStep` uses `headers`, `url_path`, `request_body`, and `extra_parameters`.
- `CreateAgentStep` uses `response_filter`.

## HTTP and Proxy

- Base HTTP client: `modules/common/http/infrastructure/window-fetch-http-client.ts`.
- OpenSearch proxy: `modules/common/http/infrastructure/proxy-http-client.ts` (via `/api/console/proxy`).
- Plugin wiring: `public/plugin.ts` calls `setHttpClient` and `setProxyHttpClient`.

## Adding a New Provider

1) Add an entry to `provider-model-config.ts` (include `response_filter`, `headers`, `request_body`, etc.).
2) Ensure `default_endpoint_regex` is correct for ML Commons.
3) Test the installation from the UI (the installer will use your configuration).

## Contributions and Tests

- Respect the `application/domain/infrastructure` separation.
- Use existing factories and mappers to keep consistency.
- Unit tests exist per module (look for `*.test.ts`).

---

For module-specific details, check the README files inside each module folder.

## Prompt Customization Examples (before/after)

Targeted examples to customize prompts per provider and tool.

- Connector system prompt (`ASSISTANT_PROMPT`)
  - File: `public/dashboard-assistant/modules/connector/domain/constants.ts`

```
// BEFORE
export const ASSISTANT_PROMPT = "You're an Artificial intelligence analyst ... For general questions that don't require tool usage, respond with plain text.";

// AFTER (add markdown guidance and stricter JSON rule)
export const ASSISTANT_PROMPT = "You are a concise cybersecurity assistant. For tool usage, respond ONLY with raw JSON (one line, no backticks). For general answers, prefer short, well‑structured Markdown.";
```

- Agent LLM tool prompt
  - File: `public/dashboard-assistant/modules/installation-manager/infrastructure/steps/create-agent-step.ts`

```
// BEFORE (excerpt)
parameters: {
  model_id: modelId,
  prompt: `Human: You're an Artificial intelligence analyst ... Respond directly and concisely.

\${parameters.chat_history:-}

Human: \${parameters.question}

Assistant:`,
}

// AFTER (clear style + JSON reminder for tools)
parameters: {
  model_id: modelId,
  prompt: `System: You are a concise cybersecurity assistant. If any tool is invoked, output ONLY the raw JSON string, no extra text. Otherwise, answer briefly.

\${parameters.chat_history:-}

Human: \${parameters.question}

Assistant:`,
}
```

- Provider response filter per API
  - File: `public/dashboard-assistant/provider-model-config.ts`

```
// BEFORE (OpenAI)
OpenAI: {
  ...,
  response_filter: '$.choices[0].message.content',
}

// AFTER (Custom provider that returns { output_text: "..." })
CustomProvider: {
  model_family: 'Custom',
  model_provider: 'Custom',
  models: ['x1'],
  default_model: 'x1',
  default_endpoint: 'api.custom.ai',
  default_endpoint_regex: String.raw`^https://api\\.custom\\.ai/.*$`,
  response_filter: '$.output_text',
  url_path: '/v1/complete',
  headers: { Authorization: 'Bearer ${credential.api_key}' },
  request_body: '{ "model": "${parameters.model}", "messages": ${parameters.messages} }',
}
```

- Model connectivity test prompt
  - File: `public/dashboard-assistant/components/model-test-result.tsx`

```
// BEFORE
export const TEST_PROMPT = 'Hello!';

// AFTER (more realistic)
export const TEST_PROMPT = 'Briefly say hello and identify yourself as the dashboard assistant.';
```

- SearchIndexTool description (index, DSL, JSON‑only)
  - File: `public/dashboard-assistant/modules/installation-manager/infrastructure/steps/create-agent-step.ts`

```
// BEFORE: mentions wazuh-alerts-* only

// AFTER: support extra index and reiterate JSON rules
description: `Use this tool only to query Wazuh indices. Prefer 'wazuh-alerts-*'; use 'wazuh-archives-*' for archives. Always return ONLY a JSON string as input for the tool. JSON MUST include top-level 'index' and 'query' (OpenSearch DSL). Optional 'size', 'sort', 'aggs' also at top-level. ...`,
```

## Troubleshooting (common issues)

- 403 Forbidden when reading active agent
  - Context: `AgentOpenSearchRepository.getActive()` reads `/.plugins-ml-config/_doc/os_chat`.
  - Fix: ensure your user/role has permissions to read/write that document; otherwise a friendly 403 is thrown.

- 404 on `/.plugins-ml-config/_doc/os_chat`
  - Meaning: no active agent registered yet (not an endpoint error). Run the installer or the register step.

- 400/401 from provider endpoint
  - Check API key and `Authorization` header in `provider-model-config.ts` and the connector factory.
  - Ensure `trusted_connector_endpoints_regex` allows your endpoint (see `UpdateMlCommonsSettingsStep`).

- Model predict returns empty/unknown shape
  - Update `response_filter` for your provider so content is extracted correctly.
  - Verify `request_body` matches the provider’s expected schema (OpenAI vs Anthropic, etc.).

- Token usage is missing or fields differ
  - UI supports OpenAI (`prompt_tokens`, `completion_tokens`) and Anthropic (`input_tokens`, `output_tokens`). If your provider differs, you may ignore usage or adapt the UI.

- CORS/proxy issues
  - All OpenSearch calls must go through `ProxyHttpClient` (configured in `public/plugin.ts`). Direct browser calls to `_plugins/_ml/...` will fail.

- Failed to update ML Commons settings
  - Requires cluster-level permissions to `PUT /_cluster/settings`. Check roles and security settings.

Quick checks
- Verify provider config: `provider-model-config.ts` (headers, response_filter, url_path).
- Confirm ML settings: `trusted_connector_endpoints_regex` contains your endpoint.
- Test model: run `_predict` via UI test and review devtools network panel for error payloads.
