# openwisp-mcp

A secure, MCP-only server for OpenWISP.

## What it does

- Diagnostic and full MCP toolsets
- Secure defaults: no silent mock fallback, no web UI
- Optional explicit mock sandbox for local testing
- Runs as a secure MCP-only service through the monorepo wrappers: `npm run variant:diagnostic` and `npm run variant:full`

## Security

- `OPENWISP_BASE_URL` / `OPENWISP_URL` required unless `OPENWISP_MOCK_SANDBOX=true`
- `OPENWISP_API_TOKEN` / `OPENWISP_TOKEN` required for live mode
- `OPENWISP_API_TOKEN_FILE` / `OPENWISP_TOKEN_FILE` supported
- Generate a suitable HTTP token with `openssl rand -hex 32` and set it as `MCP_HTTP_BEARER_TOKEN`
- `OPENWISP_ALLOW_HTTP=true` required for HTTP URLs
- SSE/HTTP mode requires `MCP_HTTP_BEARER_TOKEN` (at least 32 characters); send it as `Authorization: Bearer <token>` on both `/sse` and `/message`
- Put the HTTP service behind TLS when exposing it remotely; the bearer token is otherwise sent in cleartext
- OpenWISP API secrets are cleared from `process.env` after loading

## Monorepo layout

- `packages/openwisp-diagnostic`: dedicated read-only variant wrapper
- `packages/openwisp-full`: dedicated full-management variant wrapper
- root `src/`: shared secure MCP runtime used by both variants

## Quick start

```bash
npm install
npm run variant:diagnostic
npm run variant:full
```

## Docker / SSE deployment

A prebuilt image is published to `ghcr.io/marten-lucas/openwisp-mcp`.
It runs the MCP server over **SSE** (HTTP) so remote agents (e.g. Hermes) can
connect without a local stdio process.

The image contains a small `server.mjs` bridge that spawns the correct variant
bin (stdio) and exposes it via `SSEServerTransport` on port `8000`:

- `GET /sse` — the SSE endpoint (MCP client connects here)
- `POST /message` — the message channel for the SSE session

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MCP_VARIANT` | Yes | `diagnostic` (read-only) or `full` |
| `OPENWISP_BASE_URL` | Yes | OpenWISP controller URL |
| `OPENWISP_API_TOKEN` | Yes | Bearer token for live mode |
| `MCP_HTTP_BEARER_TOKEN` | Yes | Client token for `/sse` and `/message` (minimum 32 characters) |
| `MCP_PORT` | No | Listen port (default `8000`) |

Plus the same variables listed under
[Environment variables](#environment-variables) below
(`OPENWISP_ALLOW_HTTP`, mock sandbox, etc.).

### Example

```bash
docker run -p 8000:8000 \
  -e MCP_VARIANT=diagnostic \
  -e MCP_HTTP_BEARER_TOKEN=replace-with-a-random-token-of-at-least-32-characters \
  -e OPENWISP_BASE_URL=https://openwisp.example.com \
  -e OPENWISP_API_TOKEN=your-api-token \
  ghcr.io/marten-lucas/openwisp-mcp:latest
```

```yaml
# Coolify / Docker Compose
services:
  openwisp-diag-mcp:
    image: ghcr.io/marten-lucas/openwisp-mcp:latest
    environment:
      - MCP_VARIANT=diagnostic
      - MCP_HTTP_BEARER_TOKEN=${MCP_HTTP_BEARER_TOKEN}
      - OPENWISP_BASE_URL=${OPENWISP_BASE_URL}
      - OPENWISP_API_TOKEN=${OPENWISP_API_TOKEN}
```

## Environment variables

| Variable | Purpose |
|---|---|
| `OPENWISP_BASE_URL` | OpenWISP controller URL |
| `OPENWISP_URL` | Alias for `OPENWISP_BASE_URL` |
| `OPENWISP_API_TOKEN` | Bearer token for live mode |
| `OPENWISP_TOKEN` | Alias for `OPENWISP_API_TOKEN` |
| `OPENWISP_API_TOKEN_FILE` | Path to token file |
| `OPENWISP_TOKEN_FILE` | Alias for token file |
| `OPENWISP_MOCK_SANDBOX` | Set `true` to use mock data explicitly |
| `OPENWISP_ALLOW_HTTP` | Set `true` to allow HTTP base URLs |
| `MCP_HTTP_BEARER_TOKEN` | Required for SSE mode; at least 32 characters |
| `OPENWISP_MCP_MODE` | `diagnostic` or `full` for STDIO mode |

## Tool coverage

The server is aligned to the documented OpenWISP Controller API families most relevant to secure MCP operations:

- Users & auth
- Devices & device connections
- Credentials & tokens
- Templates & config management
- Geo & locations
- Certificates & VPN
- Network topology
- RADIUS & WiFi
- Organizations & groups

## Notes

The previous AI Studio web UI surface has been removed; the runtime is MCP-only.
