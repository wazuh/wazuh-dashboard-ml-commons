# Module `model`

Manages the lifecycle of external models registered in ML Commons.

## Purpose

- Register, list, delete and deploy models.
- Test model connectivity/response.
- Map ML Commons states to UI states.

## Structure

```
model/
  application/
    use-cases/             # create-model, get-models, delete..., validate-connection
    mapper/                # ModelStateMapper, associations with agent
    dtos/, ports/          # Contracts for repos
  domain/
    entities/, enums/, types
  hooks/
    use-models, use-model-test, use-delete-model
  infrastructure/
    opensearch/
      repositories/        # ModelOpenSearchRepository
      factories/           # ModelOpenSearchCreateFactory
      mappers/, dtos/
  model-predict-validator.ts
```

## Key configuration points

- Connectivity test prompt:
  - File: `components/model-test-result.tsx`
  - Constant: `TEST_PROMPT`
  - Used by `ModelOpenSearchRepository.validateConnection`.

- State → UI state mapping:
  - File: `application/mapper/model-state-mapper.ts`
  - Adjust if you need to change how `ACTIVE/INACTIVE/ERROR` are shown.

## Repository and use cases

- `createModelUseCase` → `/_plugins/_ml/models/_register` (and then `deploy`).
- `validateModelConnectionUseCase` → `/_plugins/_ml/models/{id}/_predict`.
- `ModelOpenSearchRepository` → Real implementation of operations.

## Tips

- `CreateModelStep` gets `connector_id` from the previous step and optionally `model_group_id`.
- If you change the provider payload shape, also check the `response_filter` in `provider-model-config.ts`.
