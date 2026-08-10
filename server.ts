import express from 'express';
import { processMcpMessage } from './src/mcp/mcpServerLogic';
import { OPENWISP_MCP_TOOLS } from './src/data/openwispTools';
import { executeOpenWispApiCall } from './src/mcp/openwispClient';
import { McpConnectionConfig, McpJsonRpcRequest } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json());

// Enable CORS for MCP Hub / external MCP clients
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-openwisp-base-url, x-openwisp-token, x-openwisp-use-mock');
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

// 1. Root GET Info Endpoint - Pure JSON MCP Server Metadata (No Frontend UI)
app.get('/', (req, res) => {
  const host = req.headers.host || 'localhost:3000';
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const appUrl = `${protocol}://${host}`;

  res.json({
    name: 'openwisp-mcp-server',
    version: '1.0.0',
    description: 'Model Context Protocol (MCP) Server for OpenWISP REST API',
    type: 'mcp-server',
    frontend: false,
    status: 'online',
    protocol_version: '2024-11-05',
    transport_endpoints: {
      jsonrpc_http: `${appUrl}/mcp`,
      sse: `${appUrl}/sse`
    },
    mcphub_config_example: {
      mcpServers: {
        "openwisp-mcp-server": {
          "url": `${appUrl}/sse`,
          "headers": {
            "x-openwisp-base-url": "https://your-openwisp-instance.com",
            "x-openwisp-token": "your-openwisp-api-token"
          }
        }
      }
    },
    cli_command: 'npx openwisp-mcp-server',
    available_tools_count: OPENWISP_MCP_TOOLS.length,
    tools: OPENWISP_MCP_TOOLS.map(t => ({
      name: t.name,
      description: t.description,
      method: t.method,
      endpoint: t.endpoint,
      parameters: t.parameters
    }))
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', server: 'openwisp-mcp-server', timestamp: new Date().toISOString() });
});
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', server: 'openwisp-mcp-server', timestamp: new Date().toISOString() });
});

// 2. MCP HTTP Endpoint (JSON-RPC 2.0)
const handleMcpJsonRpc = async (req: express.Request, res: express.Response) => {
  try {
    const mcpRequest: McpJsonRpcRequest = req.body;
    const config = getReqConfig(req);
    const mcpResponse = await processMcpMessage(mcpRequest, config);
    res.json(mcpResponse);
  } catch (err: any) {
    res.status(500).json({
      jsonrpc: '2.0',
      id: req.body?.id || null,
      error: { code: -32603, message: `Internal server error: ${err.message}` }
    });
  }
};

app.post('/mcp', handleMcpJsonRpc);
app.post('/api/mcp', handleMcpJsonRpc);

// 3. MCP SSE Endpoint (Server-Sent Events)
const handleMcpSse = (req: express.Request, res: express.Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  res.write('event: endpoint\n');
  res.write(`data: /mcp\n\n`);

  const keepAlive = setInterval(() => {
    res.write(': ping\n\n');
  }, 15000);

  req.on('close', () => {
    clearInterval(keepAlive);
  });
};

app.get('/sse', handleMcpSse);
app.get('/api/mcp/sse', handleMcpSse);

// 4. Tools Metadata Endpoint
app.get('/tools', (req, res) => {
  res.json({
    success: true,
    count: OPENWISP_MCP_TOOLS.length,
    tools: OPENWISP_MCP_TOOLS
  });
});
app.get('/api/openwisp/tools', (req, res) => {
  res.json({
    success: true,
    count: OPENWISP_MCP_TOOLS.length,
    tools: OPENWISP_MCP_TOOLS
  });
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
app.post('/api/openwisp/execute', async (req, res) => {
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
  console.log(`[OpenWISP MCP Server] Pure MCP Server listening on http://0.0.0.0:${PORT} (No Frontend)`);
});
