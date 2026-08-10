export interface OpenWispDevice {
  id: string;
  name: string;
  mac: string;
  model: string;
  ip_address: string;
  organization: string;
  status: 'online' | 'offline' | 'warning';
  last_ip: string;
  hardware: string;
  os: string;
  system: string;
  created: string;
  modified: string;
  templates?: string[];
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

export interface OpenWispTemplate {
  id: string;
  name: string;
  backend: string; // e.g., 'netjsonconfig.OpenWrt'
  type: 'vpn' | 'wireless' | 'network' | 'system' | 'generic';
  organization: string;
  default: boolean;
  required: boolean;
  config: Record<string, any>;
  created: string;
}

export interface OpenWispTopology {
  id: string;
  label: string;
  parser: string;
  strategy: string;
  organization: string;
  nodes_count: number;
  links_count: number;
  created: string;
  nodes?: OpenWispNode[];
  links?: OpenWispLink[];
}

export interface OpenWispNode {
  id: string;
  label: string;
  addresses: string[];
  organization: string;
  properties?: Record<string, any>;
}

export interface OpenWispLink {
  id: string;
  source: string;
  target: string;
  cost: number;
  status: 'up' | 'down';
  organization: string;
}

export interface OpenWispUser {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  organizations: string[];
  date_joined: string;
}

export interface OpenWispOrganization {
  id: string;
  name: string;
  slug: string;
  created: string;
}

export interface OpenWispRadiusSession {
  id: string;
  username: string;
  calling_station_id: string; // MAC address
  framed_ip_address: string;
  acct_start_time: string;
  acct_stop_time?: string;
  acct_input_octets: number;
  acct_output_octets: number;
  organization: string;
}

export interface McpToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
  default?: any;
  enum?: string[];
}

export interface McpToolDefinition {
  name: string;
  category: 'Users & Auth' | 'Devices & Controller' | 'Templates' | 'Network Topology' | 'RADIUS & WiFi' | 'Organizations';
  description: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  parameters: McpToolParameter[];
  sampleArguments?: Record<string, any>;
}

export interface McpConnectionConfig {
  baseUrl: string;
  apiToken: string;
  useMockSandbox: boolean;
  organizationSlug?: string;
}

export interface McpJsonRpcRequest {
  jsonrpc: '2.0';
  id?: string | number;
  method: string;
  params?: any;
}

export interface McpJsonRpcResponse {
  jsonrpc: '2.0';
  id?: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export interface ApiExecutionLog {
  id: string;
  timestamp: string;
  toolName: string;
  method: string;
  endpoint: string;
  args: Record<string, any>;
  status: number | 'PENDING' | 'ERROR';
  durationMs: number;
  mcpRequest: McpJsonRpcRequest;
  mcpResponse?: McpJsonRpcResponse;
  rawOpenwispResponse?: any;
  isMock: boolean;
}
