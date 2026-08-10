import {
  McpConnectionConfig,
  OpenWispDevice,
  OpenWispTemplate,
  OpenWispUser,
  OpenWispTopology,
  OpenWispOrganization
} from '../types';
import {
  MOCK_DEVICES,
  MOCK_TEMPLATES,
  MOCK_TOPOLOGIES,
  MOCK_USERS,
  MOCK_ORGANIZATIONS,
  MOCK_RADIUS_SESSIONS
} from '../data/mockOpenwisp';

// In-memory state for mock sandbox so updates/creations persist during session
let mockDevicesState = [...MOCK_DEVICES];
let mockTemplatesState = [...MOCK_TEMPLATES];
let mockUsersState = [...MOCK_USERS];
let mockOrganizationsState = [...MOCK_ORGANIZATIONS];

export async function executeOpenWispApiCall(
  toolName: string,
  args: Record<string, any>,
  config: McpConnectionConfig
): Promise<{ data: any; isMock: boolean; rawStatus: number; endpoint: string; method: string }> {
  // Check if live execution should be used
  const isLiveConfigured = config.baseUrl && config.baseUrl.trim() !== '' && !config.useMockSandbox;

  if (isLiveConfigured) {
    try {
      return await executeLiveApiCall(toolName, args, config);
    } catch (err: any) {
      console.warn(`[OpenWISP Live API Error] ${err.message}. Falling back to mock response.`);
      const mockResult = executeMockApiCall(toolName, args);
      return {
        ...mockResult,
        data: {
          _warning: `Live API call to ${config.baseUrl} failed (${err.message}). Showing simulated sandbox result.`,
          ...mockResult.data
        }
      };
    }
  }

  // Otherwise, use mock sandbox directly
  return executeMockApiCall(toolName, args);
}

async function executeLiveApiCall(
  toolName: string,
  args: Record<string, any>,
  config: McpConnectionConfig
): Promise<{ data: any; isMock: boolean; rawStatus: number; endpoint: string; method: string }> {
  const cleanBaseUrl = config.baseUrl.replace(/\/+$/, '');
  let endpointPath = '';
  let method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET';
  let bodyPayload: any = null;
  const queryParams = new URLSearchParams();

  switch (toolName) {
    case 'openwisp_obtain_token':
      endpointPath = '/api/v1/users/token/';
      method = 'POST';
      bodyPayload = { username: args.username, password: args.password };
      break;

    case 'openwisp_list_users':
      endpointPath = '/api/v1/users/user/';
      if (args.search) queryParams.set('search', args.search);
      if (args.organization) queryParams.set('organization', args.organization);
      if (args.page) queryParams.set('page', String(args.page));
      break;

    case 'openwisp_get_user':
      endpointPath = `/api/v1/users/user/${encodeURIComponent(args.id)}/`;
      break;

    case 'openwisp_create_user':
      endpointPath = '/api/v1/users/user/';
      method = 'POST';
      bodyPayload = args;
      break;

    case 'openwisp_delete_user':
      endpointPath = `/api/v1/users/user/${encodeURIComponent(args.id)}/`;
      method = 'DELETE';
      break;

    case 'openwisp_list_organizations':
      endpointPath = '/api/v1/users/organization/';
      if (args.search) queryParams.set('search', args.search);
      break;

    case 'openwisp_list_devices':
      endpointPath = '/api/v1/controller/device/';
      if (args.organization) queryParams.set('organization', args.organization);
      if (args.template) queryParams.set('template', args.template);
      if (args.status && args.status !== 'all') queryParams.set('status', args.status);
      if (args.search) queryParams.set('search', args.search);
      if (args.page) queryParams.set('page', String(args.page));
      break;

    case 'openwisp_get_device':
      endpointPath = `/api/v1/controller/device/${encodeURIComponent(args.id)}/`;
      break;

    case 'openwisp_create_device':
      endpointPath = '/api/v1/controller/device/';
      method = 'POST';
      bodyPayload = args;
      break;

    case 'openwisp_update_device':
      endpointPath = `/api/v1/controller/device/${encodeURIComponent(args.id)}/`;
      method = 'PATCH';
      bodyPayload = { ...args };
      delete bodyPayload.id;
      break;

    case 'openwisp_delete_device':
      endpointPath = `/api/v1/controller/device/${encodeURIComponent(args.id)}/`;
      method = 'DELETE';
      break;

    case 'openwisp_get_device_config':
      endpointPath = `/api/v1/controller/device/${encodeURIComponent(args.id)}/configuration/`;
      break;

    case 'openwisp_list_device_groups':
      endpointPath = '/api/v1/controller/device-group/';
      if (args.organization) queryParams.set('organization', args.organization);
      break;

    case 'openwisp_list_templates':
      endpointPath = '/api/v1/controller/template/';
      if (args.organization) queryParams.set('organization', args.organization);
      if (args.type) queryParams.set('type', args.type);
      if (args.backend) queryParams.set('backend', args.backend);
      break;

    case 'openwisp_get_template':
      endpointPath = `/api/v1/controller/template/${encodeURIComponent(args.id)}/`;
      break;

    case 'openwisp_create_template':
      endpointPath = '/api/v1/controller/template/';
      method = 'POST';
      bodyPayload = args;
      break;

    case 'openwisp_list_topologies':
      endpointPath = '/api/v1/network-topology/topology/';
      if (args.organization) queryParams.set('organization', args.organization);
      break;

    case 'openwisp_get_topology':
      endpointPath = `/api/v1/network-topology/topology/${encodeURIComponent(args.id)}/`;
      break;

    case 'openwisp_list_nodes':
      endpointPath = '/api/v1/network-topology/node/';
      if (args.topology) queryParams.set('topology', args.topology);
      break;

    case 'openwisp_list_links':
      endpointPath = '/api/v1/network-topology/link/';
      if (args.topology) queryParams.set('topology', args.topology);
      if (args.status && args.status !== 'all') queryParams.set('status', args.status);
      break;

    case 'openwisp_list_radius_sessions':
      endpointPath = '/api/v1/radius/accounting/';
      if (args.username) queryParams.set('username', args.username);
      if (args.calling_station_id) queryParams.set('calling_station_id', args.calling_station_id);
      if (args.page) queryParams.set('page', String(args.page));
      break;

    case 'openwisp_get_radius_usage':
      endpointPath = '/api/v1/radius/usage/';
      if (args.organization) queryParams.set('organization', args.organization);
      if (args.username) queryParams.set('username', args.username);
      break;

    default:
      throw new Error(`Unknown OpenWISP MCP tool: ${toolName}`);
  }

  const fullUrl = `${cleanBaseUrl}${endpointPath}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

  if (config.apiToken && toolName !== 'openwisp_obtain_token') {
    headers['Authorization'] = config.apiToken.startsWith('Bearer ') || config.apiToken.startsWith('Token ')
      ? config.apiToken
      : `Bearer ${config.apiToken}`;
  }

  const res = await fetch(fullUrl, {
    method,
    headers,
    body: bodyPayload ? JSON.stringify(bodyPayload) : undefined
  });

  const responseText = await res.text();
  let jsonResult: any;
  try {
    jsonResult = JSON.parse(responseText);
  } catch {
    jsonResult = { rawText: responseText };
  }

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${jsonResult.detail || jsonResult.message || responseText}`);
  }

  return {
    data: jsonResult,
    isMock: false,
    rawStatus: res.status,
    endpoint: endpointPath,
    method
  };
}

function executeMockApiCall(
  toolName: string,
  args: Record<string, any>
): { data: any; isMock: boolean; rawStatus: number; endpoint: string; method: string } {
  switch (toolName) {
    case 'openwisp_obtain_token':
      return {
        data: {
          token: 'token_mock_openwisp_99812489012481092412894',
          user_id: 'usr-001',
          username: args.username || 'admin',
          expires_in: 86400
        },
        isMock: true,
        rawStatus: 200,
        endpoint: '/api/v1/users/token/',
        method: 'POST'
      };

    case 'openwisp_list_users':
      let users = [...mockUsersState];
      if (args.search) {
        const s = args.search.toLowerCase();
        users = users.filter(u => u.username.toLowerCase().includes(s) || u.email.toLowerCase().includes(s));
      }
      return {
        data: {
          count: users.length,
          results: users
        },
        isMock: true,
        rawStatus: 200,
        endpoint: '/api/v1/users/user/',
        method: 'GET'
      };

    case 'openwisp_get_user':
      const user = mockUsersState.find(u => u.id === args.id || u.username === args.id) || mockUsersState[0];
      return {
        data: user,
        isMock: true,
        rawStatus: 200,
        endpoint: `/api/v1/users/user/${args.id}/`,
        method: 'GET'
      };

    case 'openwisp_create_user':
      const newUser: OpenWispUser = {
        id: `usr-${Date.now().toString(36)}`,
        username: args.username,
        email: args.email,
        first_name: args.first_name || '',
        last_name: args.last_name || '',
        is_active: args.is_active !== undefined ? args.is_active : true,
        is_staff: args.is_staff || false,
        organizations: ['default'],
        date_joined: new Date().toISOString()
      };
      mockUsersState.unshift(newUser);
      return {
        data: newUser,
        isMock: true,
        rawStatus: 201,
        endpoint: '/api/v1/users/user/',
        method: 'POST'
      };

    case 'openwisp_delete_user':
      mockUsersState = mockUsersState.filter(u => u.id !== args.id);
      return {
        data: { detail: `User ${args.id} successfully deleted.` },
        isMock: true,
        rawStatus: 200,
        endpoint: `/api/v1/users/user/${args.id}/`,
        method: 'DELETE'
      };

    case 'openwisp_list_organizations':
      return {
        data: {
          count: mockOrganizationsState.length,
          results: mockOrganizationsState
        },
        isMock: true,
        rawStatus: 200,
        endpoint: '/api/v1/users/organization/',
        method: 'GET'
      };

    case 'openwisp_list_devices':
      let devices = [...mockDevicesState];
      if (args.status && args.status !== 'all') {
        devices = devices.filter(d => d.status === args.status);
      }
      if (args.search) {
        const s = args.search.toLowerCase();
        devices = devices.filter(d => d.name.toLowerCase().includes(s) || d.mac.toLowerCase().includes(s) || d.model.toLowerCase().includes(s));
      }
      return {
        data: {
          count: devices.length,
          results: devices
        },
        isMock: true,
        rawStatus: 200,
        endpoint: '/api/v1/controller/device/',
        method: 'GET'
      };

    case 'openwisp_get_device':
      const dev = mockDevicesState.find(d => d.id === args.id || d.mac === args.id) || mockDevicesState[0];
      return {
        data: dev,
        isMock: true,
        rawStatus: 200,
        endpoint: `/api/v1/controller/device/${args.id}/`,
        method: 'GET'
      };

    case 'openwisp_create_device':
      const newDev: OpenWispDevice = {
        id: `dev-${Date.now().toString(36)}`,
        name: args.name,
        mac: args.mac,
        model: args.model || 'Generic OpenWrt Device',
        ip_address: '192.168.1.' + Math.floor(Math.random() * 200 + 10),
        organization: args.organization || 'default',
        status: 'online',
        last_ip: '198.51.100.12',
        hardware: 'Generic ARM Router',
        os: 'OpenWrt 23.05.3',
        system: args.system || 'OpenWrt',
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        templates: ['tpl-wifi-corp']
      };
      mockDevicesState.unshift(newDev);
      return {
        data: newDev,
        isMock: true,
        rawStatus: 201,
        endpoint: '/api/v1/controller/device/',
        method: 'POST'
      };

    case 'openwisp_update_device':
      const targetDev = mockDevicesState.find(d => d.id === args.id);
      if (targetDev) {
        if (args.name) targetDev.name = args.name;
        if (args.templates) targetDev.templates = args.templates;
        targetDev.modified = new Date().toISOString();
      }
      return {
        data: targetDev || { id: args.id, updated: true },
        isMock: true,
        rawStatus: 200,
        endpoint: `/api/v1/controller/device/${args.id}/`,
        method: 'PATCH'
      };

    case 'openwisp_delete_device':
      mockDevicesState = mockDevicesState.filter(d => d.id !== args.id);
      return {
        data: { detail: `Device ${args.id} deleted successfully.` },
        isMock: true,
        rawStatus: 200,
        endpoint: `/api/v1/controller/device/${args.id}/`,
        method: 'DELETE'
      };

    case 'openwisp_get_device_config':
      return {
        data: {
          backend: 'netjsonconfig.OpenWrt',
          files: [
            {
              path: '/etc/config/wireless',
              contents: '# NetJSON Compiled Config for ' + args.id + '\nconfig wifi-device radio0\n\toption type mac80211\n\toption channel auto\n\nconfig wifi-iface wlan0\n\toption device radio0\n\toption mode ap\n\toption ssid OpenWISP-Corporate\n'
            },
            {
              path: '/etc/config/network',
              contents: 'config interface lan\n\toption proto static\n\toption ipaddr 192.168.1.1\n\toption netmask 255.255.255.0\n'
            }
          ]
        },
        isMock: true,
        rawStatus: 200,
        endpoint: `/api/v1/controller/device/${args.id}/configuration/`,
        method: 'GET'
      };

    case 'openwisp_list_device_groups':
      return {
        data: {
          count: 2,
          results: [
            { id: 'grp-01', name: 'Core Gateways', organization: 'default', devices_count: 5 },
            { id: 'grp-02', name: 'Campus Access Points', organization: 'berlin-campus', devices_count: 18 }
          ]
        },
        isMock: true,
        rawStatus: 200,
        endpoint: '/api/v1/controller/device-group/',
        method: 'GET'
      };

    case 'openwisp_list_templates':
      let templates = [...mockTemplatesState];
      if (args.type) templates = templates.filter(t => t.type === args.type);
      return {
        data: {
          count: templates.length,
          results: templates
        },
        isMock: true,
        rawStatus: 200,
        endpoint: '/api/v1/controller/template/',
        method: 'GET'
      };

    case 'openwisp_get_template':
      const tpl = mockTemplatesState.find(t => t.id === args.id) || mockTemplatesState[0];
      return {
        data: tpl,
        isMock: true,
        rawStatus: 200,
        endpoint: `/api/v1/controller/template/${args.id}/`,
        method: 'GET'
      };

    case 'openwisp_create_template':
      const newTpl: OpenWispTemplate = {
        id: `tpl-${Date.now().toString(36)}`,
        name: args.name,
        backend: args.backend || 'netjsonconfig.OpenWrt',
        type: args.type || 'wireless',
        organization: args.organization || 'default',
        default: args.default || false,
        required: false,
        config: args.config || {},
        created: new Date().toISOString()
      };
      mockTemplatesState.unshift(newTpl);
      return {
        data: newTpl,
        isMock: true,
        rawStatus: 201,
        endpoint: '/api/v1/controller/template/',
        method: 'POST'
      };

    case 'openwisp_list_topologies':
      return {
        data: {
          count: MOCK_TOPOLOGIES.length,
          results: MOCK_TOPOLOGIES
        },
        isMock: true,
        rawStatus: 200,
        endpoint: '/api/v1/network-topology/topology/',
        method: 'GET'
      };

    case 'openwisp_get_topology':
      return {
        data: MOCK_TOPOLOGIES[0],
        isMock: true,
        rawStatus: 200,
        endpoint: `/api/v1/network-topology/topology/${args.id}/`,
        method: 'GET'
      };

    case 'openwisp_list_nodes':
      return {
        data: {
          count: MOCK_TOPOLOGIES[0].nodes?.length || 0,
          results: MOCK_TOPOLOGIES[0].nodes || []
        },
        isMock: true,
        rawStatus: 200,
        endpoint: '/api/v1/network-topology/node/',
        method: 'GET'
      };

    case 'openwisp_list_links':
      return {
        data: {
          count: MOCK_TOPOLOGIES[0].links?.length || 0,
          results: MOCK_TOPOLOGIES[0].links || []
        },
        isMock: true,
        rawStatus: 200,
        endpoint: '/api/v1/network-topology/link/',
        method: 'GET'
      };

    case 'openwisp_list_radius_sessions':
      return {
        data: {
          count: MOCK_RADIUS_SESSIONS.length,
          results: MOCK_RADIUS_SESSIONS
        },
        isMock: true,
        rawStatus: 200,
        endpoint: '/api/v1/radius/accounting/',
        method: 'GET'
      };

    case 'openwisp_get_radius_usage':
      return {
        data: {
          organization: args.organization || 'default',
          total_sessions: 142,
          active_users: 28,
          download_gb: 124.5,
          upload_gb: 18.2,
          period: 'last_30_days'
        },
        isMock: true,
        rawStatus: 200,
        endpoint: '/api/v1/radius/usage/',
        method: 'GET'
      };

    default:
      return {
        data: { message: `Executed tool ${toolName}` },
        isMock: true,
        rawStatus: 200,
        endpoint: `/api/v1/generic/${toolName}/`,
        method: 'GET'
      };
  }
}
