import { McpToolDefinition } from '../types';

export const OPENWISP_MCP_TOOLS: McpToolDefinition[] = [
  // ---------------- AUTH & USERS ----------------
  {
    name: 'openwisp_obtain_token',
    category: 'Users & Auth',
    description: 'Obtain an API bearer token using OpenWISP username and password credentials.',
    endpoint: '/api/v1/users/token/',
    method: 'POST',
    parameters: [
      { name: 'username', type: 'string', description: 'OpenWISP admin or user username', required: true },
      { name: 'password', type: 'string', description: 'User password', required: true }
    ],
    sampleArguments: { username: 'admin', password: 'password123' }
  },
  {
    name: 'openwisp_list_users',
    category: 'Users & Auth',
    description: 'List user accounts in OpenWISP with support for pagination and search.',
    endpoint: '/api/v1/users/user/',
    method: 'GET',
    parameters: [
      { name: 'organization', type: 'string', description: 'Filter users by organization ID or slug', required: false },
      { name: 'search', type: 'string', description: 'Search term for username, email, or full name', required: false },
      { name: 'page', type: 'number', description: 'Page number for paginated results', required: false, default: 1 },
      { name: 'page_size', type: 'number', description: 'Number of records per page', required: false, default: 20 }
    ],
    sampleArguments: { page: 1, page_size: 10 }
  },
  {
    name: 'openwisp_get_user',
    category: 'Users & Auth',
    description: 'Retrieve detailed information for a specific OpenWISP user by ID.',
    endpoint: '/api/v1/users/user/{id}/',
    method: 'GET',
    parameters: [
      { name: 'id', type: 'string', description: 'UUID or ID of the user', required: true }
    ],
    sampleArguments: { id: 'usr-001' }
  },
  {
    name: 'openwisp_create_user',
    category: 'Users & Auth',
    description: 'Create a new user in OpenWISP with role and organization permissions.',
    endpoint: '/api/v1/users/user/',
    method: 'POST',
    parameters: [
      { name: 'username', type: 'string', description: 'Unique username for the account', required: true },
      { name: 'email', type: 'string', description: 'Email address', required: true },
      { name: 'first_name', type: 'string', description: 'First name', required: false },
      { name: 'last_name', type: 'string', description: 'Last name', required: false },
      { name: 'password', type: 'string', description: 'Account password', required: true },
      { name: 'is_active', type: 'boolean', description: 'Whether the account is active', required: false, default: true },
      { name: 'is_staff', type: 'boolean', description: 'Admin/staff privileges flag', required: false, default: false }
    ],
    sampleArguments: {
      username: 'johndoe',
      email: 'john.doe@example.com',
      first_name: 'John',
      last_name: 'Doe',
      password: 'SecurePass123!',
      is_active: true
    }
  },
  {
    name: 'openwisp_delete_user',
    category: 'Users & Auth',
    description: 'Delete a user account from OpenWISP.',
    endpoint: '/api/v1/users/user/{id}/',
    method: 'DELETE',
    parameters: [
      { name: 'id', type: 'string', description: 'UUID or ID of the user to remove', required: true }
    ],
    sampleArguments: { id: 'usr-003' }
  },

  // ---------------- ORGANIZATIONS ----------------
  {
    name: 'openwisp_list_organizations',
    category: 'Organizations',
    description: 'List multi-tenant organizations managed within OpenWISP.',
    endpoint: '/api/v1/users/organization/',
    method: 'GET',
    parameters: [
      { name: 'search', type: 'string', description: 'Filter by organization name or slug', required: false }
    ],
    sampleArguments: {}
  },

  // ---------------- DEVICES & CONTROLLER ----------------
  {
    name: 'openwisp_list_devices',
    category: 'Devices & Controller',
    description: 'List registered network devices (OpenWrt routers, access points, switches) in OpenWISP Controller.',
    endpoint: '/api/v1/controller/device/',
    method: 'GET',
    parameters: [
      { name: 'organization', type: 'string', description: 'Organization ID or slug filter', required: false },
      { name: 'template', type: 'string', description: 'Filter devices assigned to specific template ID', required: false },
      { name: 'status', type: 'string', description: 'Filter by online/offline status', required: false, enum: ['online', 'offline', 'all'] },
      { name: 'search', type: 'string', description: 'Search by device name, MAC address, IP, or model', required: false },
      { name: 'page', type: 'number', description: 'Page number', required: false, default: 1 }
    ],
    sampleArguments: { status: 'all', page: 1 }
  },
  {
    name: 'openwisp_get_device',
    category: 'Devices & Controller',
    description: 'Get details, MAC address, model, status, and IP address for a specific device.',
    endpoint: '/api/v1/controller/device/{id}/',
    method: 'GET',
    parameters: [
      { name: 'id', type: 'string', description: 'Device UUID or ID', required: true }
    ],
    sampleArguments: { id: 'dev-001' }
  },
  {
    name: 'openwisp_create_device',
    category: 'Devices & Controller',
    description: 'Register a new network device in OpenWISP Controller.',
    endpoint: '/api/v1/controller/device/',
    method: 'POST',
    parameters: [
      { name: 'name', type: 'string', description: 'Friendly device name (e.g. Gateway-Berlin-01)', required: true },
      { name: 'mac', type: 'string', description: 'Hardware MAC Address (e.g. 00:11:22:33:44:55)', required: true },
      { name: 'organization', type: 'string', description: 'Organization ID or slug', required: true },
      { name: 'model', type: 'string', description: 'Hardware model (e.g. GL.iNet GL-AR750S or TP-Link Archer C7)', required: false },
      { name: 'system', type: 'string', description: 'Operating system backend (e.g. OpenWrt)', required: false, default: 'OpenWrt' }
    ],
    sampleArguments: {
      name: 'AP-Office-North',
      mac: '00:1B:44:11:3A:B7',
      organization: 'default',
      model: 'GL.iNet GL-AXT1800'
    }
  },
  {
    name: 'openwisp_update_device',
    category: 'Devices & Controller',
    description: 'Update network device metadata, assigned organization, or templates.',
    endpoint: '/api/v1/controller/device/{id}/',
    method: 'PATCH',
    parameters: [
      { name: 'id', type: 'string', description: 'Device UUID or ID', required: true },
      { name: 'name', type: 'string', description: 'Updated device name', required: false },
      { name: 'templates', type: 'array', description: 'List of template UUIDs to assign to this device', required: false }
    ],
    sampleArguments: { id: 'dev-001', name: 'AP-Office-Main-Updated' }
  },
  {
    name: 'openwisp_delete_device',
    category: 'Devices & Controller',
    description: 'Delete a network device registration from OpenWISP Controller.',
    endpoint: '/api/v1/controller/device/{id}/',
    method: 'DELETE',
    parameters: [
      { name: 'id', type: 'string', description: 'Device UUID or ID to delete', required: true }
    ],
    sampleArguments: { id: 'dev-003' }
  },
  {
    name: 'openwisp_get_device_config',
    category: 'Devices & Controller',
    description: 'Generate and download compiled NetJSON configuration for a device.',
    endpoint: '/api/v1/controller/device/{id}/configuration/',
    method: 'GET',
    parameters: [
      { name: 'id', type: 'string', description: 'Device UUID or ID', required: true }
    ],
    sampleArguments: { id: 'dev-001' }
  },
  {
    name: 'openwisp_list_device_groups',
    category: 'Devices & Controller',
    description: 'List device groups created for organizing network hardware.',
    endpoint: '/api/v1/controller/device-group/',
    method: 'GET',
    parameters: [
      { name: 'organization', type: 'string', description: 'Organization filter', required: false }
    ],
    sampleArguments: {}
  },

  // ---------------- TEMPLATES ----------------
  {
    name: 'openwisp_list_templates',
    category: 'Templates',
    description: 'List OpenWISP configuration templates (VPN, WiFi SSIDs, Firewall, Network rules).',
    endpoint: '/api/v1/controller/template/',
    method: 'GET',
    parameters: [
      { name: 'organization', type: 'string', description: 'Filter by organization ID or slug', required: false },
      { name: 'backend', type: 'string', description: 'Filter by backend (e.g., netjsonconfig.OpenWrt)', required: false },
      { name: 'type', type: 'string', description: 'Template category filter', required: false, enum: ['vpn', 'wireless', 'network', 'system', 'generic'] }
    ],
    sampleArguments: { type: 'wireless' }
  },
  {
    name: 'openwisp_get_template',
    category: 'Templates',
    description: 'Get configuration template details including NetJSON config structure.',
    endpoint: '/api/v1/controller/template/{id}/',
    method: 'GET',
    parameters: [
      { name: 'id', type: 'string', description: 'Template UUID', required: true }
    ],
    sampleArguments: { id: 'tpl-wifi-guest' }
  },
  {
    name: 'openwisp_create_template',
    category: 'Templates',
    description: 'Create a reusable configuration template in NetJSON format for OpenWISP devices.',
    endpoint: '/api/v1/controller/template/',
    method: 'POST',
    parameters: [
      { name: 'name', type: 'string', description: 'Template title (e.g. Corporate Guest WiFi)', required: true },
      { name: 'type', type: 'string', description: 'Template type', required: true, enum: ['vpn', 'wireless', 'network', 'system', 'generic'] },
      { name: 'backend', type: 'string', description: 'Config engine backend', required: false, default: 'netjsonconfig.OpenWrt' },
      { name: 'organization', type: 'string', description: 'Organization ID or slug', required: true },
      { name: 'default', type: 'boolean', description: 'Automatically assign to new devices', required: false, default: false },
      { name: 'config', type: 'object', description: 'NetJSON configuration payload object', required: true }
    ],
    sampleArguments: {
      name: 'Guest WPA3 WiFi',
      type: 'wireless',
      backend: 'netjsonconfig.OpenWrt',
      organization: 'default',
      default: false,
      config: {
        wireless: [
          {
            name: 'wlan0',
            ssid: 'Guest-WiFi-OpenWISP',
            encryption: 'sae-mixed',
            key: 'GuestPass2026!'
          }
        ]
      }
    }
  },

  // ---------------- NETWORK TOPOLOGY ----------------
  {
    name: 'openwisp_list_topologies',
    category: 'Network Topology',
    description: 'List network topologies collected via mesh protocols (OLSR, Batman-adv, WireGuard, OpenVPN).',
    endpoint: '/api/v1/network-topology/topology/',
    method: 'GET',
    parameters: [
      { name: 'organization', type: 'string', description: 'Organization filter', required: false }
    ],
    sampleArguments: {}
  },
  {
    name: 'openwisp_get_topology',
    category: 'Network Topology',
    description: 'Retrieve network topology details including node list, link metrics, and graph connections.',
    endpoint: '/api/v1/network-topology/topology/{id}/',
    method: 'GET',
    parameters: [
      { name: 'id', type: 'string', description: 'Topology UUID', required: true }
    ],
    sampleArguments: { id: 'topo-mesh-01' }
  },
  {
    name: 'openwisp_list_nodes',
    category: 'Network Topology',
    description: 'List nodes (routers/switches/endpoints) participating in a network topology.',
    endpoint: '/api/v1/network-topology/node/',
    method: 'GET',
    parameters: [
      { name: 'topology', type: 'string', description: 'Filter nodes belonging to specific topology ID', required: false }
    ],
    sampleArguments: { topology: 'topo-mesh-01' }
  },
  {
    name: 'openwisp_list_links',
    category: 'Network Topology',
    description: 'List physical or virtual links between nodes in a network topology with link status.',
    endpoint: '/api/v1/network-topology/link/',
    method: 'GET',
    parameters: [
      { name: 'topology', type: 'string', description: 'Filter links belonging to specific topology ID', required: false },
      { name: 'status', type: 'string', description: 'Link status filter', required: false, enum: ['up', 'down', 'all'] }
    ],
    sampleArguments: { status: 'up' }
  },

  // ---------------- RADIUS & WIFI ----------------
  {
    name: 'openwisp_list_radius_sessions',
    category: 'RADIUS & WiFi',
    description: 'List RADIUS authentication and accounting sessions for WiFi hot-spots and captive portals.',
    endpoint: '/api/v1/radius/accounting/',
    method: 'GET',
    parameters: [
      { name: 'username', type: 'string', description: 'Filter RADIUS sessions by end-user username', required: false },
      { name: 'calling_station_id', type: 'string', description: 'Filter by client MAC address', required: false },
      { name: 'page', type: 'number', description: 'Page number', required: false, default: 1 }
    ],
    sampleArguments: { page: 1 }
  },
  {
    name: 'openwisp_get_radius_usage',
    category: 'RADIUS & WiFi',
    description: 'Get aggregated RADIUS bandwidth and session usage metrics for an organization or user.',
    endpoint: '/api/v1/radius/usage/',
    method: 'GET',
    parameters: [
      { name: 'organization', type: 'string', description: 'Organization slug or ID', required: false },
      { name: 'username', type: 'string', description: 'User account filter', required: false }
    ],
    sampleArguments: { organization: 'default' }
  }
];

// Export full tool definitions
export const OPENWISP_FULL_TOOLS: McpToolDefinition[] = OPENWISP_MCP_TOOLS;

// Filter diagnostic tools (read-only GET methods)
export const OPENWISP_DIAGNOSTIC_TOOLS: McpToolDefinition[] = OPENWISP_MCP_TOOLS.filter(
  tool => tool.method === 'GET'
);

// Helper function to get tools by server mode
export function getOpenWispTools(mode: 'diagnostic' | 'full' = 'full'): McpToolDefinition[] {
  if (mode === 'diagnostic') {
    return OPENWISP_DIAGNOSTIC_TOOLS;
  }
  return OPENWISP_FULL_TOOLS;
}
