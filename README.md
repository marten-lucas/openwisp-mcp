# openwisp-mcp

A secure, MCP-only server for OpenWISP.

## What it does

- Diagnostic and full MCP toolsets
- Secure defaults: no silent mock fallback, no web UI
- Optional explicit mock sandbox for local testing
- Works with STDIO via `npm run mcp`, `npm run mcp:diagnostic`, or `npm run mcp:full`

## Security

- `OPENWISP_BASE_URL` / `OPENWISP_URL` required unless `OPENWISP_MOCK_SANDBOX=true`
- `OPENWISP_API_TOKEN` / `OPENWISP_TOKEN` required for live mode
- `OPENWISP_API_TOKEN_FILE` / `OPENWISP_TOKEN_FILE` supported
- `OPENWISP_ALLOW_HTTP=true` required for HTTP URLs
- Secrets are cleared from `process.env` after loading

## Monorepo layout

- `packages/diagnostic`: dedicated read-only variant wrapper
- `packages/full`: dedicated full-management variant wrapper
- root `src/`: shared secure MCP runtime used by both variants

## Quick start

```bash
npm install
npm run variant:diagnostic
npm run variant:full
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
| `OPENWISP_MCP_MODE` | `diagnostic` or `full` for STDIO mode |

## Tool coverage

- Users & auth
- Devices & controller
- Templates
- Geo & locations
- Certificates & VPN
- Network topology
- RADIUS & WiFi
- Organizations

## Notes

The previous AI Studio web UI surface has been removed; the runtime is MCP-only.
