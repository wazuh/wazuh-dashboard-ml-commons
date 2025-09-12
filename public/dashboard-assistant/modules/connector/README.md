# Module `connector`

Manages ML Commons connectors to external LLM providers (OpenAI, Anthropic, etc.).

## Purpose

- Create HTTP connectors with the appropriate headers, body and parameters for each provider.
- Prepare the message format (including the assistant's initial prompt).

## Structure

```
connector/
  application/
    use-cases/           # create-connector
    dtos/                # CreateConnectorDto, UpdateConnectorDto
    ports/               # ConnectorRepository (contract)
  domain/
    constants.ts         # ASSISTANT_PROMPT (base prompt for the connector)
    entities/            # Connector, ConnectorAction
  infrastructure/
    opensearch/
      repositories/      # ConnectorOpenSearchRepository
      factories/         # ConnectorOpenSearchCreateFactory, ConnectorActionFactory
      dtos/              # DTOs for request/response
```

## Key configuration points

- Connector prompt (assistant's first message):
  - File: `connector/domain/constants.ts`
  - Constant: `ASSISTANT_PROMPT`
  - Inserted as `messages[0]` in `ConnectorOpenSearchCreateFactory`.

- Messages and request body:
  - File: `connector/infrastructure/opensearch/factories/connector-opensearch-create-factory.ts`
  - Fields: `parameters.messages`, `actions[0].request_body`, `headers`
  - Populated using `CreateConnectorDto` and `provider-model-config.ts`.

- Provider-specific configuration:
  - File: `public/dashboard-assistant/provider-model-config.ts`
  - Defines `headers`, `url_path`, `request_body`, `extra_parameters`, `response_filter`, etc.

## Repository and use case

- `createConnectorUseCase` → Creates the connector at `/_plugins/_ml/connectors/_create`.
- `ConnectorOpenSearchRepository` → Real implementation.

## Tips

- If you change `ASSISTANT_PROMPT`, keep the output rules clear (for example, when to respond with plain text vs. JSON for specific tools).
- Verify that `request_body` and `headers` match the provider and API version.
