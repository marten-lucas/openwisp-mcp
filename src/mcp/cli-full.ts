#!/usr/bin/env node
import { processMcpMessage } from './mcpServerLogic.js';
import { McpConnectionConfig, McpJsonRpcRequest } from '../types.js';
import { loadRuntimeConfig } from './runtimeConfig.js';

const config: McpConnectionConfig = loadRuntimeConfig();

// Handle STDIO transport for McpHub / Claude Desktop (Full Mode)
let buffer = '';

process.stdin.on('data', async (chunk) => {
  buffer += chunk.toString('utf8');

  const lines = buffer.split('\n');
  buffer = lines.pop() || '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    try {
      const request: McpJsonRpcRequest = JSON.parse(trimmed);
      const response = await processMcpMessage(request, config, 'full');

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

process.stderr.write(`[openwisp-mcp-full] Started via STDIO transport (Full Management Mode)\n`);
