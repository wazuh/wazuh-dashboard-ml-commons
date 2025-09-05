# Dashboard Assistant — Services

Wiring services to expose use cases and repositories to the UI. They centralize HTTP clients and module dependencies.

## Files and purpose

- `common.ts`
  - `getHttpClient` / `setHttpClient`: access/inject the base HTTP client (WindowFetchHttpClient).
  - `getProxyHttpClient` / `setProxyHttpClient`: access/inject the proxy HTTP client for OpenSearch.
  - These are initialized in `public/plugin.ts`.

- `repositories.service.ts`
  - `getRepositories(httpClient, proxyHttpClient)` returns singletons for:
    - `mlCommonsSettingsRepository`, `modelGroupRepository`, `connectorRepository`, `modelRepository`, `agentRepository`.
  - Internally it instantiates the corresponding OpenSearch/HTTP repositories.
  - Usually you don't import it directly; use `getUseCases()`.

- `ml-use-cases.service.ts`
  - `getUseCases()` returns a singleton with high-level functions:
    - Installation: `beginAssistantInstallationProcess(onProgress)` → orchestrates steps using `InstallationManager`.
    - ML Commons: `persistMlCommonsSettings`.
    - Connectors: `createConnector`.
    - Models: `createModel`, `validateModelConnection`, `getModels`, `getModelsWithAgentData`, `deleteModelWithRelatedEntities`.
    - Agents: `createAgent`, `useAgent` (registers the active agent).

## Plugin wiring

- `public/plugin.ts` creates `WindowFetchHttpClient` and wraps it in `ProxyHttpClient` for OpenSearch calls.
- It calls `setHttpClient()` and `setProxyHttpClient()` when the plugin starts.
- From that point, `getUseCases()` can resolve repositories and use cases.

## Quick examples

- Trigger installation with progress:

```ts
import { getUseCases } from '../dashboard-assistant/services/ml-use-cases.service';

const onProgress = progress => console.log(progress.toJSON?.() || progress);
const install = getUseCases().beginAssistantInstallationProcess(onProgress);

await install({
  selected_provider: 'OpenAI',
  model_id: 'gpt-4o-mini',
  api_url: 'https://api.openai.com',
  api_key: '<token>',
});
```

- Test a model connection:

```ts
import { getUseCases } from '../dashboard-assistant/services/ml-use-cases.service';

const resp = await getUseCases().validateModelConnection('<modelId>');
```

- Manually register the active agent:

```ts
import { getUseCases } from '../dashboard-assistant/services/ml-use-cases.service';

await getUseCases().useAgent('<agentId>');
```

## Extending with new use cases

1) Add methods to the appropriate repository (or create a new one if needed).
2) Implement the use case in `modules/*/application/use-cases`.
3) Expose it in `ml-use-cases.service.ts` inside the `MLUseCases` class.

## Notes

- All OpenSearch calls must go through `ProxyHttpClient` (CORS/auth). Do not invoke `_plugins/_ml/...` endpoints directly from the browser.
- `getUseCases()` and `getRepositories()` are singletons; this avoids rebuilding them on every render.
