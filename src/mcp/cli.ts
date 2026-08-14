#!/usr/bin/env node
import { processMcpMessage } from './mcpServerLogic.js';
import { McpConnectionConfig, McpJsonRpcRequest } from '../types.js';
import { loadRuntimeConfig } from './runtimeConfig.js';

const isDiagnosticFlag = process.argv.includes('--diagnostic') || process.env.OPENWISP_MCP_MODE === 'diagnostic';
const mode: 'diagnostic' | 'full' = isDiagnosticFlag ? 'diagnostic' : 'full';

const config: McpConnectionConfig = loadRuntimeConfig();

// Handle STDIO transport for McpHub / Claude Desktop
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
      const response = await processMcpMessage(request, config, mode);

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

process.stderr.write(`[openwisp-mcp-${mode}] Started via STDIO transport (${mode === 'diagnostic' ? 'Read-Only Diagnostic Mode' : 'Full Management Mode'})\n`);
