import { readFileSync, statSync } from 'node:fs';
import { McpConnectionConfig } from '../types';

function readSecretFile(filePath: string, label: string): string {
  const stat = statSync(filePath);
  const mode = stat.mode & 0o777;
  if (mode & 0o077) {
    console.warn(`[openwisp-mcp] WARNING: ${label} file ${filePath} has loose permissions (${mode.toString(8)}).`);
  }
  return readFileSync(filePath, 'utf-8').trim();
}

export function loadRuntimeConfig(): McpConnectionConfig {
  const baseUrl = process.env.OPENWISP_BASE_URL || process.env.OPENWISP_URL || '';
  const useMockSandbox = process.env.OPENWISP_MOCK_SANDBOX === 'true';

  let apiToken = process.env.OPENWISP_API_TOKEN || process.env.OPENWISP_TOKEN || '';
  const tokenFile = process.env.OPENWISP_API_TOKEN_FILE || process.env.OPENWISP_TOKEN_FILE;

  if (!apiToken && tokenFile) {
    apiToken = readSecretFile(tokenFile, 'API token');
  }

  if (!useMockSandbox) {
    if (!baseUrl) {
      throw new Error('OPENWISP_BASE_URL or OPENWISP_URL is required unless OPENWISP_MOCK_SANDBOX=true');
    }
    if (!apiToken) {
      throw new Error('OPENWISP_API_TOKEN, OPENWISP_TOKEN, or OPENWISP_API_TOKEN_FILE is required');
    }
    if (baseUrl.startsWith('http://') && process.env.OPENWISP_ALLOW_HTTP !== 'true') {
      throw new Error('OPENWISP_BASE_URL uses HTTP. Set OPENWISP_ALLOW_HTTP=true to override or use HTTPS.');
    }
  }

  delete process.env.OPENWISP_API_TOKEN;
  delete process.env.OPENWISP_TOKEN;
  delete process.env.OPENWISP_API_TOKEN_FILE;
  delete process.env.OPENWISP_TOKEN_FILE;

  return {
    baseUrl: baseUrl.replace(/\/+$/, ''),
    apiToken,
    useMockSandbox,
  };
}
