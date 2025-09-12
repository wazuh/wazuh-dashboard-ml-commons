# Dashboard Assistant — Components

A collection of UI components (EUI + React) for registering models, showing installation progress, and testing the assistant connectivity.

## What’s included

- `model-register.tsx`: comprehensive screen to register a model and run the installation.
- `model-form.tsx`: provider/model/endpoint/API key form.
- `deployment-status.tsx`: visual step-by-step progress for the Installation Manager.
- `model-test-result.tsx`: UI to display a model `_predict` result.
- `agent-status.tsx`: compact status indicator (active/inactive/error).
- `types/`: reusable types (`ModelFormData`, `StepStatus`).
- `utils/`: UI utilities (`map-to-options`).
- `index.ts`: barrel export of core components.

## Exports and import paths

- From `./components` (barrel):
  - `{ DeploymentStatus, ModelForm, ModelTestResult }`
- Direct imports:
  - `ModelRegister`: `./components/model-register`
  - `AgentStatus` (default export): `./components/agent-status`

## ModelRegister

- Typical usage:

```tsx
import { ModelRegister } from './dashboard-assistant/components/model-register';

<ModelRegister
  disabled={false}
  onCancel={() => { /* optional */ }}
  onDeployed={() => { /* optional */ }}
/>;
```

- Internally integrates `useAssistantInstallation()` to orchestrate:
  - Update ML Commons → Create Connector → Create Model → Test → Create Agent → Register Agent.
  - Opens a flyout with `DeploymentStatus` during the installation.

## ModelForm

- Props:
  - `onChange(data: ModelFormData)`: emits `{ modelProvider, model, apiUrl, apiKey }`.
  - `onValidationChange(isValid: boolean)`: true when all fields are complete.
  - `disabled?: boolean`.
- Loads default models/endpoints from `provider-model-config.ts`.

## DeploymentStatus

- Props:
  - `progress?: InstallationProgress` (from `useAssistantInstallation`).
  - `onDeploymentComplete?(): void`.
  - `onErrorDuringDeployment?(error: string): void`.
  - `showCheckDeploymentButton?: boolean`.
- Maps states to `StepStatus`: pending, loading, success, warning, error.

## ModelTestResult

- Props:
  - `isLoading: boolean`.
  - `response: ModelPredictResponse | null`.
  - `error: string | null`.
  - `modelName: string`.
- Test prompt: `TEST_PROMPT` (defined in this file). Change the message if you want a more realistic test.

## AgentStatus

- Default export that renders a dot + label according to `ModelStatus`.

## Types and utils

- `types/model-form-data.ts`: `ModelFormData` used by the form.
- `types/step-status.ts`: enum for progress states.
- `utils/map-to-options.ts`: helper for `EuiSelect` (`[{ value, text }]`).

## UI dependencies

- Built on `@elastic/eui`. Ensure the EUI theme and styles are available in your host application.
