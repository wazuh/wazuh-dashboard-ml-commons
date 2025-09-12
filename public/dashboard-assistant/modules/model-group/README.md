# Module `model-group`

Groups models in ML Commons for organization and permissions.

## Purpose

- Register and delete model groups.
- Associate models with a group at registration time.

## Structure

```
model-group/
  application/
    use-cases/             # create-model-group
    dtos/                  # CreateModelGroupDto, UpdateModelGroupDto
    ports/                 # ModelGroupRepository
  domain/
    entities/              # ModelGroup
  infrastructure/
    opensearch/
      repositories/        # ModelGroupOpenSearchRepository
      mapper/, dtos/
```

## Repository and use case

- `createModelGroupUseCase` → `/_plugins/_ml/model_groups/_register`
- `ModelGroupOpenSearchRepository` → concrete implementation

## Tips

- If you need to isolate models by provider or area, create a group and use its `id` when registering the model (`ModelOpenSearchCreateFactory`).
- The installation step can create or reuse a group according to your logic.
