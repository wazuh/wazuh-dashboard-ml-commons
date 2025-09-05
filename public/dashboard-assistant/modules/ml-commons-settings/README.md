# Module `ml-commons-settings`

Configures the ML Commons plugin at the cluster level (via `/_cluster/settings`).

## Purpose

- Enable the agent framework and RAG.
- Define `trusted_connector_endpoints_regex` to allow external provider endpoints.
- Retrieve and persist the current configuration.

## Structure

```
ml-commons-settings/
  application/
    use-cases/                   # update-ml-commons-settings
    dtos/                        # CreateMLCommonsDto
    ports/                       # MLCommonsSettingsRepository
  domain/
    entities/                    # ClusterSettings, MlCommonsPluginSettings
  infrastructure/
    repositories/                # MLCommonsSettingsHttpClientRepository
    factories/                   # MLCommonsSettingsCreateFactory
```

## Key configuration points

- `trusted_connector_endpoints_regex`:
  - Built from `provider-model-config.ts` (`default_endpoint_regex`).
  - Step: `installation-manager/.../update-ml-commons-settings-step.ts`.
- Important flags: `agent_framework_enabled`, `rag_pipeline_feature_enabled`, `only_run_on_ml_node` (see factory).

## Repository and use case

- `persistMLCommonsSettingsUseCase` → Performs `PUT /_cluster/settings` with `persistent.plugins.ml_commons`.
- `MLCommonsSettingsHttpClientRepository` → Real implementation.

## Tips

- Verify that the endpoint regex covers all your provider URLs (e.g. `https://api.openai.com/*`).
- You can call `retrieve()` to inspect the effective configuration (`include_defaults=true`).
