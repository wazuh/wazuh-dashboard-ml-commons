# Module `installation-manager`

Orchestrates the Dashboard Assistant installation by running sequential steps and reporting progress.

## Purpose

- Run steps to: configure ML Commons, create a connector, register and deploy a model, test it, create and register an agent.
- Manage a shared context (`InstallationContext`) to pass data between steps.
- Report progress and detailed errors.

## Structure

```
installation-manager/
  application/
    use-cases/                   # trigger-ai-assistant-installer
  domain/
    entities/                    # InstallationProgress, InstallationContext, Step
    enums/                       # ExecutionState, StepResultState
    interfaces/                  # IInstallationManager
    types/                       # DTOs, progress types
  hooks/
    use-assistant-installation.ts# React hook to trigger and follow installation
  infrastructure/
    installation-manager.ts      # Implementation that executes the steps
    steps/
      update-ml-commons-settings-step.ts
      create-connector-step.ts
      create-model-step.ts
      test-model-connection-step.ts
      create-agent-step.ts
      register-agent-step.ts
```

## Step-by-step (summary)

1) `UpdateMlCommonsSettingsStep` → configure `trusted_connector_endpoints_regex` and flags.
2) `CreateConnectorStep` → uses `provider-model-config.ts` for headers/body and creates the connector.
3) `CreateModelStep` → registers and deploys the model.
4) `TestModelConnectionStep` → calls `/_predict` with `TEST_PROMPT`.
5) `CreateAgentStep` → creates the agent with tools (`MLModelTool` and `SearchIndexTool`).
6) `RegisterAgentStep` → registers the active agent in `/.plugins-ml-config/_doc/os_chat`.

## Where to change prompts and tools

- Main LLM prompt and `SearchIndexTool` → `steps/create-agent-step.ts`.
- Connectivity test prompt → `components/model-test-result.tsx` (`TEST_PROMPT`).
- Connector base prompt → `connector/domain/constants.ts` (`ASSISTANT_PROMPT`).

## Usage from React

- Hook: `useAssistantInstallation()`
  - `setModel({ model_provider, model_id, api_url, api_key })` to configure.
  - `install()` to start the installation.
  - `progress`, `isLoading`, `error`, `result` for tracking.

## Adding a new step

1) Extend `InstallationAIAssistantStep` and implement `execute`, `getSuccessMessage`, `getFailureMessage`.
2) Add the step to the list in `infrastructure/installation-manager.ts`.
3) If the step produces data for others, store it in `InstallationContext` (e.g. `context.set('myKey', value)`).
