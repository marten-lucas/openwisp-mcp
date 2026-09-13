import express from 'express';
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

const app = express();
const sessions = new Map();

app.get('/sse', async (req, res) => {
  const sse = new SSEServerTransport('/message', res);
  const stdio = new StdioClientTransport({
    command: 'node',
    args: [bin],
    env: process.env,
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

app.post('/message', async (req, res) => {
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
