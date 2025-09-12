# Module `common`

Shared utilities and contracts (HTTP, generic DTOs) used by other modules.

## Purpose

- Define a single `HttpClient` interface for the entire plugin.
- Implement concrete HTTP clients and a proxy to OpenSearch.
- Unify OpenSearch response DTOs.

## Structure

```
common/
  domain/
    entities/
      http-client.ts              # HTTP client contract
    enum/
      http-method.ts              # HTTP methods
  http/
    infrastructure/
      window-fetch-http-client.ts # Fetch client with default headers
      proxy-http-client.ts        # Proxy to /api/console/proxy
  infrastructure/
    opensearch/
      dtos/                       # OpenSearch response DTOs
```

## Configuration and usage

- `WindowFetchHttpClient`
  - Adds `osd-xsrf: kibana` and `Content-Type: application/json` on POST/PUT.
  - Handles non-OK HTTP responses and returns JSON.
- `ProxyHttpClient`
  - Redirects requests to `/api/console/proxy?method=<METHOD>&path=<PATH>`.
  - Lets the frontend call OpenSearch endpoints while preserving CORS and authentication.

The plugin registers these clients in `public/plugin.ts` using `setHttpClient` and `setProxyHttpClient`.

## Tips

- If you need additional global headers, extend `WindowFetchHttpClient`.
- All calls to OpenSearch should go through `ProxyHttpClient` (do not call `_plugins/_ml/...` directly).
