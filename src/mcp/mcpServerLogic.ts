import {
  McpJsonRpcRequest,
  McpJsonRpcResponse,
  McpConnectionConfig
} from '../types';
import { OPENWISP_MCP_TOOLS } from '../data/openwispTools';
import { executeOpenWispApiCall } from './openwispClient';

export async function processMcpMessage(
  request: McpJsonRpcRequest,
  config: McpConnectionConfig
): Promise<McpJsonRpcResponse> {
  const { id, method, params } = request;

  // Handle MCP Protocol Initialize
  if (method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: { listChanged: true },
          prompts: { listChanged: true },
          resources: { listChanged: true }
        },
        serverInfo: {
          name: 'openwisp-mcp-server',
          version: '1.0.0',
          description: 'Model Context Protocol Server for OpenWISP Network Management'
        }
      }
    };
  }

  // Handle MCP Notifications
  if (method === 'notifications/initialized') {
    return {
      jsonrpc: '2.0',
      id,
      result: {}
    };
  }

  // 1. tools/list
  if (method === 'tools/list') {
    const formattedTools = OPENWISP_MCP_TOOLS.map(tool => {
      const properties: Record<string, any> = {};
      const required: string[] = [];

      tool.parameters.forEach(param => {
        properties[param.name] = {
          type: param.type,
          description: param.description
        };
        if (param.enum) {
          properties[param.name].enum = param.enum;
        }
        if (param.default !== undefined) {
          properties[param.name].default = param.default;
        }
        if (param.required) {
          required.push(param.name);
        }
      });

      return {
        name: tool.name,
        description: `[Category: ${tool.category}] ${tool.description} (HTTP ${tool.method} ${tool.endpoint})`,
        inputSchema: {
          type: 'object',
          properties,
          required
        }
      };
    });

    return {
      jsonrpc: '2.0',
      id,
      result: {
        tools: formattedTools
      }
    };
  }

  // 2. tools/call
  if (method === 'tools/call') {
    const toolName = params?.name;
    const toolArgs = params?.arguments || {};

    const toolDef = OPENWISP_MCP_TOOLS.find(t => t.name === toolName);
    if (!toolDef) {
      return {
        jsonrpc: '2.0',
        id,
        error: {
          code: -32601,
          message: `Tool not found: '${toolName}'. Use tools/list to see available OpenWISP tools.`
        }
      };
    }

    try {
      const executionResult = await executeOpenWispApiCall(toolName, toolArgs, config);

      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify(executionResult.data, null, 2)
            }
          ],
          _metadata: {
            endpoint: executionResult.endpoint,
            method: executionResult.method,
            status: executionResult.rawStatus,
            isMockSandbox: executionResult.isMock
          }
        }
      };
    } catch (err: any) {
      return {
        jsonrpc: '2.0',
        id,
        error: {
          code: -32000,
          message: `OpenWISP API Execution Error: ${err.message}`
        }
      };
    }
  }

  // 3. prompts/list
  if (method === 'prompts/list') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        prompts: [
          {
            name: 'audit_network_health',
            description: 'Inspects all OpenWISP devices, flags offline/warning nodes, and summarizes network status.',
            arguments: [
              { name: 'organization', description: 'Organization slug or ID', required: false }
            ]
          },
          {
            name: 'provision_new_ap',
            description: 'Guides the AI step-by-step through creating a new access point device and assigning templates.',
            arguments: [
              { name: 'device_name', description: 'Name for the new router/AP', required: true },
              { name: 'mac_address', description: 'Hardware MAC address', required: true }
            ]
          },
          {
            name: 'radius_bandwidth_report',
            description: 'Analyzes RADIUS accounting sessions to identify top bandwidth consumers on WiFi.',
            arguments: []
          }
        ]
      }
    };
  }

  // 4. prompts/get
  if (method === 'prompts/get') {
    const promptName = params?.name;
    if (promptName === 'audit_network_health') {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          description: 'Network Audit Prompt',
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: 'Please call `openwisp_list_devices` to retrieve all registered network devices. Identify any devices with offline status or warnings, check their assigned templates with `openwisp_list_templates`, and provide a structured health summary.'
              }
            }
          ]
        }
      };
    }
  }

  // 5. resources/list
  if (method === 'resources/list') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        resources: [
          {
            uri: 'openwisp://docs/rest-api',
            name: 'OpenWISP REST API Reference Documentation',
            description: 'Official API documentation for users, controller, topology, templates, and RADIUS modules',
            mimeType: 'text/markdown'
          },
          {
            uri: 'openwisp://system/status',
            name: 'OpenWISP MCP Server Bridge Status',
            description: 'Current connection state to OpenWISP controller instance',
            mimeType: 'application/json'
          }
        ]
      }
    };
  }

  // Default method unknown
  return {
    jsonrpc: '2.0',
    id,
    error: {
      code: -32601,
      message: `Method '${method}' not supported by OpenWISP MCP Server.`
    }
  };
}
