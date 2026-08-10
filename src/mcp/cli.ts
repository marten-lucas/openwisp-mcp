#!/usr/bin/env node
import { processMcpMessage } from './mcpServerLogic.js';
import { McpConnectionConfig, McpJsonRpcRequest } from '../types.js';

const config: McpConnectionConfig = {
  baseUrl: process.env.OPENWISP_BASE_URL || process.env.OPENWISP_URL || '',
  apiToken: process.env.OPENWISP_API_TOKEN || process.env.OPENWISP_TOKEN || '',
  useMockSandbox: process.env.OPENWISP_MOCK_SANDBOX === 'true' || (!process.env.OPENWISP_BASE_URL && !process.env.OPENWISP_URL)
};

// Handle STDIO transport for McpHub / Claude Desktop
let buffer = '';

process.stdin.on('data', async (chunk) => {
  buffer += chunk.toString('utf8');
  
  const lines = buffer.split('\n');
  buffer = lines.pop() || ''; // Keep trailing incomplete line in buffer

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    try {
      const request: McpJsonRpcRequest = JSON.parse(trimmed);
      const response = await processMcpMessage(request, config);
      
      // Send response back via stdout
      process.stdout.write(JSON.stringify(response) + '\n');
    } catch (err: any) {
      const errorResponse = {
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32700,
          message: `Parse Error: ${err.message}`
        }
      };
      process.stdout.write(JSON.stringify(errorResponse) + '\n');
    }
  }
});

process.stderr.write(`[OpenWISP MCP Server] Started via STDIO transport (BaseURL: ${config.baseUrl || 'Mock Sandbox Mode'})\n`);
