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
