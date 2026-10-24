import express from 'express';
import { timingSafeEqual } from 'node:crypto';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const VARIANT = process.env.MCP_VARIANT || 'diagnostic';

const BINS = {
  diagnostic: path.join(__dirname, 'packages', 'openwisp-diagnostic', 'bin', 'openwisp-mcp-diagnostic.mjs'),
  full: path.join(__dirname, 'packages', 'openwisp-full', 'bin', 'openwisp-mcp-full.mjs'),
};

const bin = BINS[VARIANT];
if (!bin) {
  console.error(`Unknown MCP_VARIANT "${VARIANT}". Expected "diagnostic" or "full".`);
  process.exit(1);
}

const httpBearerToken = process.env.MCP_HTTP_BEARER_TOKEN;
delete process.env.MCP_HTTP_BEARER_TOKEN;
if (!httpBearerToken || httpBearerToken.length < 32) {
  throw new Error('MCP_HTTP_BEARER_TOKEN is required and must be at least 32 characters');
}

const app = express();
const sessions = new Map();

function requireHttpAuth(req, res, next) {
  const provided = /^Bearer\s+(.+)$/i.exec(req.get('authorization') || '')?.[1];
  if (!provided) {
    res.set('WWW-Authenticate', 'Bearer').status(401).end();
    return;
  }

  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(httpBearerToken);
  if (providedBuffer.length !== expectedBuffer.length || !timingSafeEqual(providedBuffer, expectedBuffer)) {
    res.set('WWW-Authenticate', 'Bearer').status(401).end();
    return;
  }
  next();
}

app.get('/sse', requireHttpAuth, async (req, res) => {
  const sse = new SSEServerTransport('/message', res);
  const childEnv = { ...process.env };
  delete childEnv.MCP_HTTP_BEARER_TOKEN;
  const stdio = new StdioClientTransport({
    command: 'node',
    args: [bin],
    env: childEnv,
  });

  sessions.set(sse.sessionId, sse);

  // Track connection liveness so a late stdio reply after SSE close does not
  // crash the process (SSEServerTransport.send throws 'Not connected').
  let sseOpen = true;
  let stdioClosed = false;

  sse.onmessage = (msg) => {
    if (!stdioClosed) {
      stdio.send(msg).catch(() => {});
    }
  };
  stdio.onmessage = (msg) => {
    if (sseOpen) {
      try {
        sse.send(msg);
      } catch (err) {
        // SSE already closed — drop the message instead of crashing.
        sseOpen = false;
      }
    }
  };

  sse.onclose = () => {
    sseOpen = false;
    sessions.delete(sse.sessionId);
    stdio.close();
    stdioClosed = true;
  };

  await stdio.start();
  await sse.start();
});

app.post('/message', requireHttpAuth, async (req, res) => {
  const sessionId = req.query.sessionId;
  const sse = sessions.get(sessionId);
  if (sse) {
    await sse.handlePostMessage(req, res);
  } else {
    res.status(404).end();
  }
});

const port = Number(process.env.MCP_PORT || 8000);
app.listen(port, '0.0.0.0', () =>
  console.log(`OpenWISP MCP SSE Proxy (${VARIANT}) listening on port ${port}`)
);
