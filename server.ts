import express from 'express';
import { processMcpMessage } from './src/mcp/mcpServerLogic';
import { OPENWISP_FULL_TOOLS, OPENWISP_DIAGNOSTIC_TOOLS, getOpenWispTools } from './src/data/openwispTools';
import { executeOpenWispApiCall } from './src/mcp/openwispClient';
import { McpConnectionConfig, McpJsonRpcRequest } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json());

// Enable CORS for MCP Hub / external MCP clients
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-openwisp-base-url, x-openwisp-token, x-openwisp-use-mock, x-openwisp-mcp-mode');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Helper to extract OpenWISP connection configuration from request headers or environment
function getReqConfig(req: express.Request): McpConnectionConfig {
  const baseUrl = (req.headers['x-openwisp-base-url'] as string) || process.env.OPENWISP_BASE_URL || process.env.OPENWISP_URL || '';
  const apiToken = (req.headers['x-openwisp-token'] as string) || (req.headers['authorization'] as string) || process.env.OPENWISP_API_TOKEN || process.env.OPENWISP_TOKEN || '';
  const useMock = req.headers['x-openwisp-use-mock'] === 'true' || (!baseUrl && !process.env.OPENWISP_BASE_URL);

  return {
    baseUrl,
    apiToken: apiToken.replace(/^Bearer\s+/i, '').replace(/^Token\s+/i, ''),
    useMockSandbox: useMock
  };
}

// 1. Root GET Info Endpoint - Exposes dual MCP Server metadata (Diagnostic & Full)
app.get('/', (req, res) => {
  const host = req.headers.host || 'localhost:3000';
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const appUrl = `${protocol}://${host}`;

  res.json({
    name: 'openwisp-mcp-server-suite',
    version: '1.0.0',
    description: 'Dual Model Context Protocol (MCP) Server Suite for OpenWISP REST API (Diagnostic & Full)',
    type: 'mcp-server-suite',
    frontend: false,
    status: 'online',
    protocol_version: '2024-11-05',
    mcp_servers: [
      {
        id: 'openwisp-mcp-diagnostic',
        name: 'OpenWISP MCP Diagnostic Server',
        description: 'Read-only monitoring, topology auditing, device status & RADIUS session metrics.',
        type: 'read-only',
        tools_count: OPENWISP_DIAGNOSTIC_TOOLS.length,
        transport_endpoints: {
          jsonrpc_http: `${appUrl}/diagnostic/mcp`,
          sse: `${appUrl}/diagnostic/sse`
        },
        mcphub_config: {
          "openwisp-mcp-diagnostic": {
            "url": `${appUrl}/diagnostic/sse`,
            "headers": {
              "x-openwisp-base-url": "https://your-openwisp-instance.com",
              "x-openwisp-token": "your-openwisp-api-token"
            }
          }
        },
        cli_command: 'npm run mcp:diagnostic'
      },
      {
        id: 'openwisp-mcp-full',
        name: 'OpenWISP MCP Full Server',
        description: 'Complete administrative control: Read, create, update & delete devices, users & templates.',
        type: 'full-management',
        tools_count: OPENWISP_FULL_TOOLS.length,
        transport_endpoints: {
          jsonrpc_http: `${appUrl}/full/mcp`,
          sse: `${appUrl}/full/sse`
        },
        mcphub_config: {
          "openwisp-mcp-full": {
            "url": `${appUrl}/full/sse`,
            "headers": {
              "x-openwisp-base-url": "https://your-openwisp-instance.com",
              "x-openwisp-token": "your-openwisp-api-token"
            }
          }
        },
        cli_command: 'npm run mcp:full'
      }
    ],
    default_endpoints: {
      jsonrpc_http: `${appUrl}/mcp`,
      sse: `${appUrl}/sse`
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', server: 'openwisp-mcp-server-suite', timestamp: new Date().toISOString() });
});
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', server: 'openwisp-mcp-server-suite', timestamp: new Date().toISOString() });
});

// Helper handler for MCP JSON-RPC requests
const createMcpRpcHandler = (mode: 'diagnostic' | 'full') => {
  return async (req: express.Request, res: express.Response) => {
    try {
      const mcpRequest: McpJsonRpcRequest = req.body;
      const config = getReqConfig(req);
      const mcpResponse = await processMcpMessage(mcpRequest, config, mode);
      res.json(mcpResponse);
    } catch (err: any) {
      res.status(500).json({
        jsonrpc: '2.0',
        id: req.body?.id || null,
        error: { code: -32603, message: `Internal server error: ${err.message}` }
      });
    }
  };
};

// Helper handler for MCP SSE requests
const createMcpSseHandler = (mcpEndpointPath: string) => {
  return (req: express.Request, res: express.Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    res.write('event: endpoint\n');
    res.write(`data: ${mcpEndpointPath}\n\n`);

    const keepAlive = setInterval(() => {
      res.write(': ping\n\n');
    }, 15000);

    req.on('close', () => {
      clearInterval(keepAlive);
    });
  };
};

// 2. Diagnostic MCP Routes
app.post('/diagnostic/mcp', createMcpRpcHandler('diagnostic'));
app.post('/api/mcp/diagnostic', createMcpRpcHandler('diagnostic'));
app.get('/diagnostic/sse', createMcpSseHandler('/diagnostic/mcp'));
app.get('/api/mcp/diagnostic/sse', createMcpSseHandler('/diagnostic/mcp'));
app.get('/diagnostic/tools', (req, res) => {
  res.json({ success: true, mode: 'diagnostic', count: OPENWISP_DIAGNOSTIC_TOOLS.length, tools: OPENWISP_DIAGNOSTIC_TOOLS });
});

// 3. Full MCP Routes
app.post('/full/mcp', createMcpRpcHandler('full'));
app.post('/api/mcp/full', createMcpRpcHandler('full'));
app.get('/full/sse', createMcpSseHandler('/full/mcp'));
app.get('/api/mcp/full/sse', createMcpSseHandler('/full/mcp'));
app.get('/full/tools', (req, res) => {
  res.json({ success: true, mode: 'full', count: OPENWISP_FULL_TOOLS.length, tools: OPENWISP_FULL_TOOLS });
});

// 4. Default / Legacy Routes (Auto-detect mode via header or env, default 'full')
app.post('/mcp', (req, res) => {
  const reqMode = (req.headers['x-openwisp-mcp-mode'] as string) === 'diagnostic' || process.env.OPENWISP_MCP_MODE === 'diagnostic' ? 'diagnostic' : 'full';
  return createMcpRpcHandler(reqMode)(req, res);
});
app.post('/api/mcp', (req, res) => {
  const reqMode = (req.headers['x-openwisp-mcp-mode'] as string) === 'diagnostic' || process.env.OPENWISP_MCP_MODE === 'diagnostic' ? 'diagnostic' : 'full';
  return createMcpRpcHandler(reqMode)(req, res);
});
app.get('/sse', createMcpSseHandler('/mcp'));
app.get('/api/mcp/sse', createMcpSseHandler('/mcp'));

app.get('/tools', (req, res) => {
  const mode = (req.query.mode as string) === 'diagnostic' ? 'diagnostic' : 'full';
  const tools = getOpenWispTools(mode);
  res.json({ success: true, mode, count: tools.length, tools });
});

// 5. Direct Tool Execution Endpoint
app.post('/execute', async (req, res) => {
  try {
    const { toolName, args, config } = req.body;
    const connectionConfig = config || getReqConfig(req);
    const result = await executeOpenWispApiCall(toolName, args || {}, connectionConfig);
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[OpenWISP MCP Suite] Dual MCP Server listening on http://0.0.0.0:${PORT}`);
  console.log(` - Diagnostic MCP: http://0.0.0.0:${PORT}/diagnostic/sse (${OPENWISP_DIAGNOSTIC_TOOLS.length} read-only tools)`);
  console.log(` - Full MCP:       http://0.0.0.0:${PORT}/full/sse (${OPENWISP_FULL_TOOLS.length} management tools)`);
});
